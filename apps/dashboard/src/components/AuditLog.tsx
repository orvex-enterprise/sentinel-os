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

export const AuditLog: React.FC<AuditLogProps> = ({ auditTrail = [] }) => {
  if (auditTrail.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldCheck size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p>No cryptographic audit trail recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-violet)', fontWeight: 600 }}>
        <ShieldCheck size={18} />
        <h3>Cryptographic Append-Only Audit Trail</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {auditTrail.map((log) => (
          <div key={log.audit_id} style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '3px solid var(--accent-violet)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--accent-cyan)" /> {log.actor}
              </span>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{log.action_performed}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {log.previous_status || 'NONE'} &rarr; <strong style={{ color: '#fff' }}>{log.new_status}</strong>
              </span>
            </div>
            {log.details && Object.keys(log.details).length > 0 && (
              <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
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
