import React, { useState } from 'react';
import { CaseDetailData } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, XCircle, DollarSign, ShieldAlert, Cpu, UserCheck, Activity, RefreshCw, Clock } from 'lucide-react';

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
      <div className="glass-panel animate-fade-in" style={{ height: 'calc(100vh - 112px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <Cpu size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Select a business case from the left feed to inspect autonomous execution state.</p>
        </div>
      </div>
    );
  }

  const isAwaitingApproval = caseData.status === 'PENDING_APPROVAL' || caseData.status === 'AWAITING_APPROVAL';

  return (
    <div className="glass-panel animate-fade-in" style={{ height: 'calc(100vh - 112px)', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Case Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {caseData.id}
            </span>
            <span className="badge badge-critical">{caseData.severity}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Domain: {caseData.domain}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{caseData.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Target SKU: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{caseData.sku}</strong> | Statistical Anomaly Z-Score: <strong style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{caseData.zScore}</strong>
          </p>
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
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>
          <ShieldAlert size={18} />
          <h3 style={{ fontSize: '1.1rem' }}>Autonomous Root Cause Analysis (RCA)</h3>
        </div>
        <div style={{ lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <ReactMarkdown>
            {caseData.rootCauseSummary || 'Synthesizing root cause hypothesis from WMS telemetry...'}
          </ReactMarkdown>
        </div>
      </div>

      {/* Execution Plan Table */}
      {caseData.executionPlan && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Cpu size={18} />
              <h3 style={{ fontSize: '1.1rem' }}>Generated Execution Plan ({caseData.executionPlan.planId})</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <DollarSign size={16} />
              <span>Est. Financial Impact: <strong style={{ color: 'var(--text-primary)' }}>${caseData.executionPlan.estimatedFinancialImpactUsd?.toLocaleString() ?? '0'}</strong></span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Action Key</th>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Description</th>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Risk Level</th>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Expected Outcome</th>
                  <th style={{ padding: '14px 10px', fontWeight: 500 }}>Human Approval</th>
                </tr>
              </thead>
              <tbody>
                {(caseData.executionPlan.actions || []).map((act) => (
                  <tr key={act.actionKey} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px 10px', color: 'var(--text-primary)' }}>{act.actionKey}</td>
                    <td style={{ padding: '16px 10px', fontWeight: 500 }}>{act.actionType}</td>
                    <td style={{ padding: '16px 10px', color: 'var(--text-secondary)' }}>{act.description}</td>
                    <td style={{ padding: '16px 10px' }}>
                      <span className={act.riskLevel === 'HIGH' ? 'badge badge-critical' : act.riskLevel === 'MEDIUM' ? 'badge badge-warning' : 'badge badge-success'}>
                        {act.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '16px 10px', color: 'var(--text-secondary)' }}>{act.expectedOutcome}</td>
                    <td style={{ padding: '16px 10px' }}>
                      {act.requiresHumanApproval ? (
                        <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><UserCheck size={14} /> Required</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Autonomous</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--border-focus)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Contingency Strategy:</strong> <span style={{ color: 'var(--text-secondary)' }}>{caseData.executionPlan.contingencyStrategy || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Execution Progress UI */}
      {(caseData.status === 'EXECUTING' || caseData.status === 'CLOSED_SUCCESS' || caseData.status === 'RESOLVED') && caseData.executionPlan && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: 600 }}>
            <Activity size={18} className={caseData.status === 'EXECUTING' ? 'animate-pulse-glow' : ''} />
            <h3 style={{ fontSize: '1.1rem' }}>Live Execution Progress</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {caseData.executionPlan.actions.map((act, index) => {
               const isCompleted = caseData.status === 'CLOSED_SUCCESS' || caseData.status === 'RESOLVED' || caseData.auditTrail?.some(log => log.action_performed === 'EXECUTED_ACTION' && log.details?.comment?.includes(act.actionType));
               const isExecuting = caseData.status === 'EXECUTING' && !isCompleted && (index === 0 || caseData.auditTrail?.some(log => log.action_performed === 'EXECUTED_ACTION' && log.details?.comment?.includes(caseData.executionPlan!.actions[index - 1].actionType)));
               
               return (
                 <div key={act.actionKey} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: isExecuting ? 'var(--bg-tertiary)' : 'transparent', borderRadius: '8px', border: isExecuting ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)', transition: 'all 0.3s ease' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCompleted ? 'var(--accent-emerald)' : isExecuting ? 'var(--text-primary)' : 'var(--bg-tertiary)', color: isCompleted || isExecuting ? 'var(--bg-primary)' : 'var(--text-muted)' }}>
                       {isCompleted ? <CheckCircle2 size={16} /> : isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Clock size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.95rem', fontWeight: 500, color: isCompleted || isExecuting ? 'var(--text-primary)' : 'var(--text-muted)' }}>{act.description}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{act.actionType} &bull; Expected: {act.expectedOutcome}</div>
                    </div>
                    <div>
                       {isCompleted ? <span className="badge badge-success">Success</span> : isExecuting ? <span className="badge badge-warning">In Progress</span> : <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>Pending</span>}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-slide-up" style={{ width: '450px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 500 }}>Reject Execution Plan</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Please provide a reason for rejecting this autonomous remediation plan. This feedback will be indexed.</p>
            <textarea
              rows={4}
              placeholder="e.g., Supplier SUP-001 is currently undergoing labor strikes; reroute to SUP-003 instead."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!rejectReason) return;
                  await onReject(rejectReason);
                  setShowRejectModal(false);
                }}
                className="btn-danger"
                style={{ padding: '10px 24px' }}
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
