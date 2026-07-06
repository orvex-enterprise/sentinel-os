import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getCases, getCaseById, updateCaseStatus, createCaseFromEvent } from '../services/db';
import { mockAgentResponder } from '../services/mock-agent';
import { redisClient } from '../redis/client';
import { publishEvent } from '../redis/stream';
import { z } from 'zod';
import { broadcastCaseStateUpdate } from '../ws/hub';

export const casesRouter = Router();

// GET /api/v1/cases (§23.1)
casesRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 20;
    const offset = typeof req.query.offset === 'string' ? parseInt(req.query.offset, 10) : 0;

    const result = await getCases(domain, status, limit, offset);
    res.status(200).json({
      success: true,
      data: result.cases,
      pagination: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/cases/:id (§23.1)
casesRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const caseData = await getCaseById(req.params.id);
    if (!caseData) {
      res.status(404).json({ success: false, error: `Case not found: ${req.params.id}` });
      return;
    }
    res.status(200).json({
      success: true,
      data: caseData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/cases/:id/approve (§23.1)
const ApproveSchema = z.object({
  approvalToken: z.string().min(1),
  approvedBy: z.string().email().or(z.string().min(1)),
  comment: z.string().optional(),
});

casesRouter.post('/:id/approve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = ApproveSchema.parse(req.body);
    const caseData = await getCaseById(req.params.id);
    if (!caseData) {
      res.status(404).json({ success: false, error: `Case not found: ${req.params.id}` });
      return;
    }

    if (caseData.status !== 'PENDING_APPROVAL' && caseData.status !== 'AWAITING_APPROVAL') {
      res.status(409).json({
        success: false,
        error: `Conflict: Case ${req.params.id} is in status ${caseData.status}, expected PENDING_APPROVAL`,
      });
      return;
    }

    if (caseData.approvalToken && caseData.approvalToken !== validated.approvalToken) {
      res.status(409).json({ success: false, error: 'Conflict: Invalid approvalToken' });
      return;
    }

    const updated = await updateCaseStatus(req.params.id, 'APPROVED', {
      approvedBy: validated.approvedBy,
      approvedAt: new Date().toISOString(),
      comment: validated.comment,
      actor: validated.approvedBy,
      actionPerformed: 'APPROVED_EXECUTION_PLAN',
    });

    if (updated) {
      broadcastCaseStateUpdate({
        caseId: req.params.id,
        previousStatus: caseData.status,
        newStatus: 'APPROVED',
        nodeCompleted: 'plan_approved',
        executionPlanSummary: updated.executionPlan,
      });

      // Trigger mock agent execution loop for standalone testing
      mockAgentResponder.onPlanApproved(req.params.id, validated.approvedBy, validated.comment);
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation Error', details: err.format() });
      return;
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/cases/:id/reject (§23.1)
const RejectSchema = z.object({
  rejectionReason: z.string().min(1),
  rejectedBy: z.string().min(1),
});

casesRouter.post('/:id/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = RejectSchema.parse(req.body);
    const caseData = await getCaseById(req.params.id);
    if (!caseData) {
      res.status(404).json({ success: false, error: `Case not found: ${req.params.id}` });
      return;
    }

    if (caseData.status !== 'PENDING_APPROVAL' && caseData.status !== 'AWAITING_APPROVAL') {
      res.status(409).json({
        success: false,
        error: `Conflict: Case ${req.params.id} is in status ${caseData.status}, expected PENDING_APPROVAL`,
      });
      return;
    }

    const updated = await updateCaseStatus(req.params.id, 'CLOSED_REJECTED', {
      approvedBy: validated.rejectedBy,
      approvedAt: new Date().toISOString(),
      rejectionReason: validated.rejectionReason,
      actor: validated.rejectedBy,
      actionPerformed: 'REJECTED_EXECUTION_PLAN',
    });

    if (updated) {
      broadcastCaseStateUpdate({
        caseId: req.params.id,
        previousStatus: caseData.status,
        newStatus: 'CLOSED_REJECTED',
        nodeCompleted: 'plan_rejected',
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation Error', details: err.format() });
      return;
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/cases/:id/events (Sprint 2 Day 29 event dispatch endpoint)
casesRouter.post('/:id/events', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body || {};
    const eventType = payload.event_type || 'manual.event.dispatched';
    const envelope = {
      event_id: payload.event_id || crypto.randomUUID(),
      event_type: eventType,
      timestamp: new Date().toISOString(),
      source_system: req.user?.email || 'api-gateway',
      correlation_id: req.params.id,
      payload: payload.payload || payload,
      version: '1.0',
    };

    // If case ID doesn't exist yet, create it from event
    let caseData = await getCaseById(req.params.id);
    if (!caseData) {
      const newCaseId = await createCaseFromEvent(envelope);
      caseData = await getCaseById(newCaseId);
    }

    // Publish to Redis stream
    let messageId = 'mock_stream_id';
    try {
      messageId = await publishEvent(redisClient, envelope);
    } catch (redisErr: any) {
      console.warn('[Event Dispatch] Redis stream publish failed (using mock ID):', redisErr.message);
    }

    // Trigger mock agent loop
    mockAgentResponder.onEventIngested(caseData.id, caseData.sku);

    res.status(200).json({
      success: true,
      data: {
        messageId,
        caseId: caseData.id,
        envelope,
      },
    });
  } catch (err: any) {
    console.error('[Cases Route Error]:', err.stack || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
