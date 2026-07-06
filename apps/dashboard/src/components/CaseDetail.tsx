import React, { useState } from 'react';
import { CaseDetailData } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, XCircle, DollarSign, ShieldAlert, Cpu, UserCheck } from 'lucide-react';

interface CaseDetailProps {
  caseData: CaseDetailData | null;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isProcessing: boolean;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({
  caseData,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const [comment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!caseData) {
    return (
      <div className="glass-panel" style={{ height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <Cpu size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem' }}>Select a business case from the left feed to inspect autonomous execution state.</p>
        </div>
      </div>
    );
  }

  const isAwaitingApproval = caseData.status === 'PENDING_APPROVAL' || caseData.status === 'AWAITING_APPROVAL';

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 100px)', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Case Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              {caseData.id}
            </span>
            <span className="badge badge-critical">{caseData.severity}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Domain: {caseData.domain}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{caseData.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Target SKU: <strong style={{ color: '#fff' }}>{caseData.sku}</strong> | Statistical Anomaly Z-Score: <strong style={{ color: 'var(--accent-rose)' }}>{caseData.zScore}</strong></p>
        </div>

        {/* Action Controls for Human-in-the-Loop */}
        {isAwaitingApproval && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onApprove(comment)}
              disabled={isProcessing}
              className="btn-success animate-pulse-glow"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <CheckCircle2 size={18} /> {isProcessing ? 'Executing...' : 'Approve Execution Plan'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <XCircle size={18} /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Root Cause Analysis (RCA) Markdown Panel */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          <ShieldAlert size={18} />
          <h3>Autonomous Root Cause Analysis (RCA)</h3>
        </div>
        <div style={{ lineHeight: '1.6', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          <ReactMarkdown>
            {caseData.rootCauseSummary || 'Synthesizing root cause hypothesis from WMS telemetry...'}
          </ReactMarkdown>
        </div>
      </div>

      {/* Execution Plan Table */}
      {caseData.executionPlan && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              <Cpu size={18} />
              <h3>Generated Execution Plan ({caseData.executionPlan.planId})</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <DollarSign size={16} color="var(--accent-amber)" />
              <span>Est. Financial Impact: <strong style={{ color: 'var(--accent-amber)' }}>${caseData.executionPlan.estimatedFinancialImpactUsd.toLocaleString()}</strong></span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 8px' }}>Action Key</th>
                  <th style={{ padding: '12px 8px' }}>Type</th>
                  <th style={{ padding: '12px 8px' }}>Description</th>
                  <th style={{ padding: '12px 8px' }}>Risk Level</th>
                  <th style={{ padding: '12px 8px' }}>Expected Outcome</th>
                  <th style={{ padding: '12px 8px' }}>Human Approval</th>
                </tr>
              </thead>
              <tbody>
                {caseData.executionPlan.actions.map((act) => (
                  <tr key={act.actionKey} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{act.actionKey}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{act.actionType}</td>
                    <td style={{ padding: '12px 8px' }}>{act.description}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={act.riskLevel === 'HIGH' ? 'badge badge-critical' : act.riskLevel === 'MEDIUM' ? 'badge badge-warning' : 'badge badge-success'}>
                        {act.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{act.expectedOutcome}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {act.requiresHumanApproval ? (
                        <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={14} /> Required</span>
                      ) : (
                        <span style={{ color: 'var(--accent-emerald)' }}>Autonomous</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', borderLeft: '4px solid var(--accent-amber)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--accent-amber)' }}>Contingency Strategy:</strong> {caseData.executionPlan.contingencyStrategy}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: 'var(--accent-rose)', fontSize: '1.25rem' }}>Reject Execution Plan</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Please provide an authoritative reason for rejecting this autonomous remediation plan. This feedback will be indexed into the knowledge graph.</p>
            <textarea
              rows={4}
              placeholder="e.g., Supplier SUP-001 is currently undergoing labor strikes; reroute to SUP-003 instead."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!rejectReason) return;
                  await onReject(rejectReason);
                  setShowRejectModal(false);
                }}
                className="btn-danger"
                style={{ padding: '8px 20px' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
