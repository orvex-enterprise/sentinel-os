import React from 'react';
import { ShieldCheck, Clock, User, Hash } from 'lucide-react';

interface AuditLogProps {
  auditTrail?: Array<{
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

export const AuditLog: React.FC<AuditLogProps> = ({ auditTrail }) => {
  const safeTrail = auditTrail || [];
  if (safeTrail.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldCheck size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p>No cryptographic audit trail recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: 500 }}>
        <ShieldCheck size={18} />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cryptographic Append-Only Audit Trail</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {safeTrail.map((log) => (
          <div key={log.audit_id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--border-focus)', border: '1px solid var(--border-subtle)', borderLeftWidth: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--text-primary)" /> {log.actor}
              </span>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.action_performed}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {log.previous_status || 'NONE'} &rarr; <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.new_status}</strong>
              </span>
            </div>
            {log.details && Object.keys(log.details).length > 0 && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                <Hash size={10} style={{ display: 'inline', marginRight: '4px' }} />
                {JSON.stringify(log.details)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
