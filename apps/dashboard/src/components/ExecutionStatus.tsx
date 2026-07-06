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
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
        <Activity size={18} />
        <h3>LangGraph Orchestration Pipeline State</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', alignItems: 'center' }}>
        {steps.map((step) => (
          <div key={step.name} style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step.completed ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              color: step.completed ? '#fff' : 'var(--text-muted)',
              boxShadow: step.completed ? '0 0 12px rgba(16, 185, 129, 0.4)' : undefined,
            }}>
              {step.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
            </div>
            <span style={{ fontSize: '0.75rem', color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step.completed ? 600 : 400 }}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
