import React from 'react';
import { Activity, CheckCircle, Clock } from 'lucide-react';

interface ExecutionStatusProps {
  status: string;
  version: number;
}

export const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ status, version }) => {
  const steps = [
    { name: 'Anomaly Detected', completed: true },
    { name: 'LLM RCA Synthesized', completed: version >= 1 },
    { name: 'Plan Generated', completed: version >= 1 },
    { name: 'Human Approved', completed: status === 'APPROVED' || status === 'EXECUTING' || status === 'RESOLVED' || status === 'CLOSED_SUCCESS' },
    { name: 'Actions Executed', completed: status === 'RESOLVED' || status === 'CLOSED_SUCCESS' },
    { name: 'Knowledge Indexed', completed: status === 'CLOSED_SUCCESS' || status === 'RESOLVED' },
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>
        <Activity size={18} />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>LangGraph Orchestration Pipeline State</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', alignItems: 'center' }}>
        {steps.map((step) => (
          <div key={step.name} style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step.completed ? 'var(--text-primary)' : 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              color: step.completed ? 'var(--bg-primary)' : 'var(--text-muted)',
              border: step.completed ? 'none' : '1px solid var(--border-subtle)',
            }}>
              {step.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
            </div>
            <span style={{ fontSize: '0.75rem', color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step.completed ? 500 : 400 }}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
