export interface CaseItem {
  id: string;
  domain: string;
  title: string;
  status: string;
  severity: string;
  sku: string;
  zScore: number;
  updatedAt: string;
}

export interface CaseDetailData extends CaseItem {
  rootCauseSummary: string | null;
  executionPlan: {
    planId: string;
    caseId: string;
    generatedBy: string;
    timestamp: string;
    actions: Array<{
      actionKey: string;
      actionType: string;
      description: string;
      targetSku: string;
      parameters: Record<string, any>;
      riskLevel: string;
      expectedOutcome: string;
      requiresHumanApproval: boolean;
    }>;
    contingencyStrategy: string;
    estimatedFinancialImpactUsd: number;
  } | null;
  approvalToken: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  version: number;
  createdAt: string;
  auditTrail: Array<{
    audit_id: string;
    case_id: string;
    actor: string;
    action_performed: string;
    previous_status?: string;
    new_status: string;
    timestamp: string;
    details: Record<string, any>;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws?token=tok_live_demo_8849201948210';

export async function fetchCases(limit: number = 20): Promise<{cases: CaseItem[], total: number, pendingTotal: number}> {
  const res = await fetch(`${API_BASE_URL}/cases?limit=${limit}`, {
    headers: { Authorization: 'Bearer tok_live_demo_8849201948210' },
  });
  if (!res.ok) throw new Error('Failed to fetch cases');
  const json = await res.json();
  return {
    cases: json.data || [],
    total: json.pagination?.total || 0,
    pendingTotal: json.pagination?.pendingTotal || 0,
  };
}

export async function fetchCaseDetail(id: string): Promise<CaseDetailData> {
  const res = await fetch(`${API_BASE_URL}/cases/${id}`, {
    headers: { Authorization: 'Bearer tok_live_demo_8849201948210' },
  });
  if (!res.ok) throw new Error('Failed to fetch case detail');
  const json = await res.json();
  return json.data;
}

export async function approveCase(id: string, token: string, comment?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/cases/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok_live_demo_8849201948210',
      'Idempotency-Key': `idem_appr_${id}_${Date.now()}`,
    },
    body: JSON.stringify({
      approvalToken: token || 'tok_live_demo_8849201948210',
      approvedBy: 'operator@sentinel.ai',
      comment: comment || 'Approved via Mission Control Dashboard',
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Approval failed');
  }
  return res.json();
}

export async function rejectCase(id: string, reason: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/cases/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok_live_demo_8849201948210',
      'Idempotency-Key': `idem_rej_${id}_${Date.now()}`,
    },
    body: JSON.stringify({
      rejectionReason: reason,
      rejectedBy: 'operator@sentinel.ai',
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Rejection failed');
  }
  return res.json();
}

export async function dispatchSimulationEvent(sku: string = 'SKU-9942', isManual: boolean = false): Promise<any> {
  const caseId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c83e129b-0000-4000-8000-${Math.floor(Date.now() / 1000)}`;
  const res = await fetch(`${API_BASE_URL}/cases/${caseId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok_live_demo_8849201948210',
    },
    body: JSON.stringify({
      event_type: 'wms.stock_update',
      is_manual: isManual,
      payload: {
        sku,
        metrics: { current_stock: 10, reorder_point: 50 },
        z_score: 3.84,
        anomaly_score: 0.92,
      },
    }),
  });
  if (!res.ok) throw new Error('Failed to dispatch simulation event');
  return res.json();
}

export async function setSimulationState(active: boolean): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/system/simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok_live_demo_8849201948210',
    },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) throw new Error('Failed to set simulation state');
  return res.json();
}

export function connectWebSocket(onMessage: (data: any) => void): WebSocket {
  const ws = new WebSocket(WS_URL);
  ws.onopen = () => {
    console.log('[WebSocket Client] Connected to Sentinel Hub');
  };
  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.event === 'CASE_STATE_UPDATED') {
        onMessage(parsed.data);
      }
    } catch (e) {
      // Ignore non-json
    }
  };
  return ws;
}
