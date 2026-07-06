import { z } from 'zod';
import { CaseStatusSchema } from './status';

export const AnomalyEventSchema = z.object({
  anomaly_id: z.string().uuid(),
  event_type: z.string(),
  severity: z.number().min(0).max(1),
  z_score: z.number(),
  description: z.string(),
  metadata: z.record(z.any()).default({})
});

export type AnomalyEvent = z.infer<typeof AnomalyEventSchema>;

export const RootCauseAnalysisSchema = z.object({
  rca_id: z.string().uuid(),
  summary: z.string(),
  root_cause: z.string(),
  confidence_score: z.number().min(0).max(1),
  supporting_evidence: z.array(z.string()),
  created_at: z.string().datetime()
});

export type RootCauseAnalysis = z.infer<typeof RootCauseAnalysisSchema>;

export const ActionSchema = z.object({
  action_id: z.string().uuid(),
  action_type: z.string(),
  target_system: z.string(),
  parameters: z.record(z.any()),
  expected_outcome: z.string(),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  idempotency_key: z.string()
});

export type Action = z.infer<typeof ActionSchema>;

export const ExecutionPlanSchema = z.object({
  plan_id: z.string().uuid(),
  summary: z.string(),
  actions: z.array(ActionSchema),
  estimated_recovery_time_minutes: z.number().int().positive(),
  created_at: z.string().datetime()
});

export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;

export const AuditRecordSchema = z.object({
  audit_id: z.string().uuid(),
  case_id: z.string().uuid(),
  actor: z.string(),
  action_performed: z.string(),
  previous_status: CaseStatusSchema.optional(),
  new_status: CaseStatusSchema,
  timestamp: z.string().datetime(),
  details: z.record(z.any()).default({})
});

export type AuditRecord = z.infer<typeof AuditRecordSchema>;

export const BusinessCaseSchema = z.object({
  case_id: z.string().uuid(),
  domain: z.string().default('INVENTORY_OPERATIONS'),
  status: CaseStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().positive().default(1),
  anomaly: AnomalyEventSchema.optional(),
  rca: RootCauseAnalysisSchema.optional(),
  plan: ExecutionPlanSchema.optional(),
  audit_trail: z.array(AuditRecordSchema).default([])
});

export type BusinessCase = z.infer<typeof BusinessCaseSchema>;
