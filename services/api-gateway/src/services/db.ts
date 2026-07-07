import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://sentinel:sentinel_secret@localhost:5432/sentinel_db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(str: string): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

export const dbPool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

dbPool.on('error', (err) => {
  console.error('[PostgreSQL Pool] Unexpected error on idle client:', err.message);
});

// In-memory fallback state store for local/standalone development without Docker (§15.1 resilience)
interface MemoryCase {
  id: string;
  domain: string;
  title: string;
  status: string;
  severity: string;
  sku: string;
  zScore: number;
  rootCauseSummary: string | null;
  executionPlan: any | null;
  approvalToken: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  auditLogs: any[];
}

const memoryStore: Map<string, MemoryCase> = new Map();

// Seed case removed to prevent static case from being stuck at the top

let isPgAvailable: boolean | null = null;

async function checkPg(): Promise<boolean> {
  if (isPgAvailable !== null) return isPgAvailable;
  try {
    const client = await dbPool.connect();
    client.release();
    isPgAvailable = true;
    console.log('[Database] PostgreSQL connection pool verified.');
  } catch (err: any) {
    isPgAvailable = false;
    console.warn('[Database] PostgreSQL unreachable, using resilient in-memory state store.');
  }
  return isPgAvailable;
}

export async function getCases(domain?: string, status?: string, limit = 20, offset = 0): Promise<{ cases: any[]; total: number; pendingTotal: number }> {
  const usePg = await checkPg();
  if (usePg) {
    try {
      let query = 'SELECT c.*, b.affected_entities->0->>\'title\' AS custom_title FROM cases c JOIN business_cases b ON c.id = b.id WHERE 1=1';
      const params: any[] = [];
      if (domain) {
        params.push(domain);
        query += ` AND c.domain = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND c.status = $${params.length}`;
      }
      query += ` ORDER BY c.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const countQuery = 'SELECT count(*) FROM cases c WHERE 1=1' + (domain ? ` AND c.domain = '${domain}'` : '') + (status ? ` AND c.status = '${status}'` : '');
      
      const res = await dbPool.query(query, [...params, limit, offset]);
      const countRes = await dbPool.query(countQuery);
      const pendingRes = await dbPool.query("SELECT count(*) FROM cases WHERE status IN ('AWAITING_APPROVAL')");
      
      return {
        cases: res.rows.map((row) => ({
          id: row.id,
          domain: row.domain,
          title: row.custom_title || row.title,
          status: row.status,
          severity: row.severity,
          sku: row.sku,
          zScore: parseFloat(row.z_score || '0'),
          updatedAt: row.updated_at,
        })),
        total: parseInt(countRes.rows[0].count, 10),
        pendingTotal: parseInt(pendingRes.rows[0].count, 10),
      };
    } catch (err: any) {
      console.error('[Database] Query failed in getCases, falling back to in-memory store:', err.message);
      // Do not disable PostgreSQL globally on query failures
    }
  }

  // In-memory query
  let list = Array.from(memoryStore.values());
  if (domain) list = list.filter((c) => c.domain === domain);
  if (status) list = list.filter((c) => c.status === status);
  const total = list.length;
  const pendingTotal = list.filter((c) => c.status === 'PENDING_APPROVAL' || c.status === 'AWAITING_APPROVAL').length;
  const sliced = list.slice(offset, offset + limit).map((c) => ({
    id: c.id,
    domain: c.domain,
    title: c.title,
    status: c.status,
    severity: c.severity,
    sku: c.sku,
    zScore: c.zScore,
    updatedAt: c.updatedAt,
  }));
  return { cases: sliced, total, pendingTotal };
}

export async function getCaseById(id: string): Promise<any | null> {
  const usePg = await checkPg();
  if (usePg && isUuid(id)) {
    try {
      const res = await dbPool.query('SELECT c.*, b.affected_entities->0->>\'title\' AS custom_title FROM cases c JOIN business_cases b ON c.id = b.id WHERE c.id = $1', [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      
      // Fetch audit logs
      const auditRes = await dbPool.query('SELECT * FROM audit_logs WHERE case_id = $1 ORDER BY recorded_at ASC', [id]);
      
      return {
        id: row.id,
        domain: row.domain,
        title: row.custom_title || row.title,
        status: row.status,
        severity: row.severity,
        sku: row.sku,
        zScore: parseFloat(row.z_score || '0'),
        rootCauseSummary: row.root_cause_summary,
        executionPlan: row.execution_plan ? (row.execution_plan.evidence || row.execution_plan) : null,
        approvalToken: row.approval_token,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at,
        rejectionReason: row.rejection_reason,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        auditTrail: auditRes.rows.map((log) => ({
          audit_id: log.id,
          case_id: log.case_id,
          actor: log.actor,
          action_performed: log.event_type,
          previous_status: log.before_snapshot?.status,
          new_status: log.after_snapshot?.status || row.status,
          timestamp: log.recorded_at,
          details: log.metadata || {},
        })),
      };
    } catch (err: any) {
      console.error(`[Database] Query failed in getCaseById for id ${id}, falling back to in-memory store:`, err.message);
      // Do not disable PostgreSQL globally on query failures
    }
  }

  const memCase = memoryStore.get(id);
  if (!memCase) return null;
  return {
    ...memCase,
    auditTrail: memCase.auditLogs,
  };
}

export async function updateCaseStatus(
  id: string,
  newStatus: string,
  updates: {
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    actor?: string;
    actionPerformed?: string;
    comment?: string;
    rootCauseSummary?: string;
    executionPlan?: any;
  }
): Promise<any | null> {
  if (newStatus === 'REJECTED') newStatus = 'CLOSED_REJECTED';
  if (newStatus === 'RESOLVED') newStatus = 'CLOSED_SUCCESS';
  if (newStatus === 'PENDING_APPROVAL') newStatus = 'AWAITING_APPROVAL';

  const usePg = await checkPg();
  if (usePg && isUuid(id)) {
    try {
      const currentRes = await dbPool.query('SELECT status, version FROM cases WHERE id = $1', [id]);
      if (currentRes.rows.length === 0) return null;
      const oldStatus = currentRes.rows[0].status;
      const oldVersion = currentRes.rows[0].version;

      const now = new Date().toISOString();
      await dbPool.query(
        `UPDATE business_cases SET 
          status = $1::case_status, 
          approved_by = COALESCE((SELECT id FROM users WHERE email = $2 LIMIT 1), approved_by),
          approved_at = COALESCE($3::timestamptz, approved_at),
          approval_comment = COALESCE($4, approval_comment),
          approval_decision = CASE WHEN $1::text = 'APPROVED' THEN 'APPROVED' WHEN $1::text = 'CLOSED_REJECTED' THEN 'REJECTED' ELSE approval_decision END,
          root_cause_hypothesis = COALESCE($7, root_cause_hypothesis),
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND version = $6`,
        [newStatus, updates.approvedBy || null, updates.approvedAt || null, updates.comment || updates.rejectionReason || null, id, oldVersion, updates.rootCauseSummary || null]
      );

      if (updates.executionPlan) {
        const decisionId = `DEC-${Math.floor(Math.random() * 89999 + 10000)}`;
        await dbPool.query(
          `INSERT INTO decisions (public_id, case_id, plan_version, recommendation_summary, confidence_score, risk_score, reasoning_summary, evidence, alternative_decisions, status, created_by, schema_version)
           VALUES ($1, $2, $3, $4, 0.95, 0.35, $5, $6::jsonb, $7::jsonb, 'PENDING', $8, '1.0')
           ON CONFLICT (case_id, plan_version) DO UPDATE SET
             recommendation_summary = EXCLUDED.recommendation_summary,
             evidence = EXCLUDED.evidence`,
          [
            decisionId,
            id,
            1,
            updates.comment || `Execution plan for case ${id}`,
            updates.rootCauseSummary || 'Automated analysis',
            JSON.stringify(updates.executionPlan),
            JSON.stringify([]),
            updates.actor || 'agent:plan:v1'
          ]
        );
      }

      // Record audit log
      await dbPool.query(
        `INSERT INTO audit_logs (case_id, event_type, actor, actor_type, before_snapshot, after_snapshot, correlation_id)
         VALUES ($1, $2, $3, 'OPERATOR', $4, $5, uuid_generate_v4())`,
        [
          id,
          updates.actionPerformed || `STATUS_CHANGE_${newStatus}`,
          updates.actor || updates.approvedBy || 'operator@sentinel.ai',
          JSON.stringify({ status: oldStatus }),
          JSON.stringify({ status: newStatus, comment: updates.comment || updates.rejectionReason }),
        ]
      );

      const memCase = memoryStore.get(id);
      if (memCase) {
        memCase.status = newStatus;
        memCase.version += 1;
        memCase.updatedAt = new Date().toISOString();
        if (updates.approvedBy) memCase.approvedBy = updates.approvedBy;
        if (updates.approvedAt) memCase.approvedAt = updates.approvedAt;
        if (updates.rejectionReason) memCase.rejectionReason = updates.rejectionReason;
        if (updates.rootCauseSummary) memCase.rootCauseSummary = updates.rootCauseSummary;
        if (updates.executionPlan) memCase.executionPlan = updates.executionPlan;
      }

      return getCaseById(id);
    } catch (err: any) {
      console.error(`[Database] Update failed in updateCaseStatus for id ${id}, falling back to in-memory store:`, err.message);
      // Do not disable PostgreSQL globally on query failures
    }
  }

  const memCase = memoryStore.get(id);
  if (!memCase) return null;

  const oldStatus = memCase.status;
  memCase.status = newStatus;
  memCase.version += 1;
  memCase.updatedAt = new Date().toISOString();
  if (updates.approvedBy) memCase.approvedBy = updates.approvedBy;
  if (updates.approvedAt) memCase.approvedAt = updates.approvedAt;
  if (updates.rejectionReason) memCase.rejectionReason = updates.rejectionReason;
  if (updates.rootCauseSummary) memCase.rootCauseSummary = updates.rootCauseSummary;
  if (updates.executionPlan) memCase.executionPlan = updates.executionPlan;

  memCase.auditLogs.push({
    audit_id: `11111111-0000-0000-0000-${Math.floor(Math.random() * 8999999990 + 1000000000)}`,
    case_id: id,
    actor: updates.actor || updates.approvedBy || 'operator@sentinel.ai',
    action_performed: updates.actionPerformed || `STATUS_CHANGE_${newStatus}`,
    previous_status: oldStatus,
    new_status: newStatus,
    timestamp: memCase.updatedAt,
    details: { comment: updates.comment || updates.rejectionReason },
  });

  return {
    ...memCase,
    auditTrail: memCase.auditLogs,
  };
}

export async function createCaseFromEvent(envelope: any): Promise<string> {
  const caseId = `c83e129b-0000-4000-8000-${Math.floor(Math.random() * 899999999000 + 100000000000)}`;
  const sku = envelope.payload?.sku || envelope.sku || 'SKU-7821';
  
  let formattedName = envelope.name || `Anomaly Detected: ${sku}`;
  if (formattedName.startsWith('SCEN-')) {
    // Convert "SCEN-001-STOCKOUT-RISK" to "Stockout Risk"
    formattedName = formattedName.replace(/^SCEN-\d+-/, '').replace(/-/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
  const eventTitle = formattedName;
  
  const zScore = envelope.payload?.z_score || 2.85;
  let severity = 'MEDIUM';
  if (zScore >= 3.5) severity = 'CRITICAL';
  else if (zScore >= 2.0) severity = 'HIGH';
  else severity = 'LOW';

  const memCase: MemoryCase = {
    id: caseId,
    domain: envelope.domain || 'INVENTORY',
    title: eventTitle,
    status: 'DETECTED',
    severity,
    sku,
    zScore,
    rootCauseSummary: envelope.payload?.root_cause_hint || 'Simulated Anomaly: Sudden 35% spike in demand detected at regional distribution center, causing imminent stockout risk before the next scheduled supplier delivery.',
    executionPlan: {
      planId: `plan_${Math.random().toString(36).substring(7)}`,
      caseId: caseId,
      generatedBy: 'agent:plan:v1',
      timestamp: new Date().toISOString(),
      actions: [
        {
          actionKey: `act_${Math.random().toString(36).substring(7)}`,
          actionType: 'PO_EXPEDITE',
          description: `Expedite emergency air freight shipment for ${sku}`,
          targetSku: sku,
          parameters: { poId: `PO-${Math.floor(Math.random() * 9000 + 1000)}`, expediteFeeUsd: Math.floor(Math.random() * 500 + 100) },
          riskLevel: Math.random() > 0.5 ? 'MEDIUM' : 'HIGH',
          expectedOutcome: `Advance delivery arrival by ${Math.floor(Math.random() * 4 + 1)} days`,
          requiresHumanApproval: true,
        },
        {
          actionKey: `act_${Math.random().toString(36).substring(7)}`,
          actionType: 'SAFETY_STOCK_ADJUST',
          description: `Reallocate buffer stock for ${sku} from secondary warehouse`,
          targetSku: sku,
          parameters: { sourceWarehouse: Math.random() > 0.5 ? 'WH-002' : 'WH-003', qty: envelope.payload?.metrics?.daily_demand || 25 },
          riskLevel: 'LOW',
          expectedOutcome: 'Restore safety stock margin',
          requiresHumanApproval: false,
        }
      ],
      contingencyStrategy: 'If air freight fails, trigger automated cross-docking from regional hub.',
      estimatedFinancialImpactUsd: envelope.payload?.metrics?.daily_demand ? envelope.payload.metrics.daily_demand * 125 : Math.floor(Math.random() * 5000 + 1000),
    },
    approvalToken: `tok_${Math.random().toString(36).substring(7)}`,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditLogs: [
      {
        audit_id: `11111111-0000-0000-0000-${Math.floor(Math.random() * 8999999990 + 1000000000)}`,
        case_id: caseId,
        actor: envelope.source_system || 'agent:monitor:v1',
        action_performed: 'CASE_CREATED_FROM_EVENT',
        previous_status: undefined,
        new_status: 'DETECTED',
        timestamp: new Date().toISOString(),
        details: envelope.payload || {},
      },
    ],
  };

  memoryStore.set(caseId, memCase);

  const usePg = await checkPg();
  if (usePg) {
    try {
      const publicId = `CASE-${Math.floor(Math.random() * 89999 + 10000)}`;
      await dbPool.query(
        `INSERT INTO business_cases (id, public_id, warehouse_id, domain, status, anomaly_type, severity, detection_confidence, schema_version, affected_entities, baseline_delta, approval_comment, root_cause_hypothesis, created_at, updated_at)
         VALUES ($1, $2, '11111111-1111-1111-1111-111111111111', $3::domain_type, 'DETECTED', 'STOCKOUT_RISK', 'HIGH', 0.95, '1.0', $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [caseId, publicId, memCase.domain, JSON.stringify([{ sku, title: eventTitle }]), memCase.zScore, memCase.approvalToken, memCase.rootCauseSummary]
      );
      // Insert a decision record so the execution_plan view is not null
      await dbPool.query(
        `INSERT INTO decisions (public_id, case_id, plan_version, recommendation_summary, confidence_score, risk_score, reasoning_summary, evidence, status, created_by, schema_version)
         VALUES ($1, $2, 1, 'Auto-generated plan', 0.9, 0.5, 'Generated by simulator', $3, 'PENDING', 'agent:plan:v1', '1.0')`,
        [`DEC-${Math.floor(Math.random() * 89999 + 10000)}`, caseId, JSON.stringify(memCase.executionPlan)]
      );
      await dbPool.query(
        `INSERT INTO audit_logs (case_id, event_type, actor, actor_type, before_snapshot, after_snapshot, correlation_id)
         VALUES ($1, 'CASE_CREATED_FROM_EVENT', $2, 'SYSTEM', '{}', $3, uuid_generate_v4())`,
        [caseId, envelope.source_system || 'agent:monitor:v1', JSON.stringify({ status: 'DETECTED', sku })]
      );
      
      console.log(`[Database] Inserted case ${caseId} (${publicId}) into PostgreSQL.`);
    } catch (err: any) {
      console.error(`[Database] Failed to insert case ${caseId} into PostgreSQL:`, err.message);
    }
  }

  return caseId;
}

