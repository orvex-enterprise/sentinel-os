import React, { useState } from 'react';
import { CaseItem } from '../services/api';
import { Search, AlertTriangle, Activity, Clock, Layers } from 'lucide-react';

interface CaseFeedProps {
  cases: CaseItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

export const CaseFeed: React.FC<CaseFeedProps> = ({
  cases,
  selectedId,
  onSelect,
  onTriggerSimulation,
  isSimulating,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'ALL' || 
      c.status === statusFilter ||
      (statusFilter === 'RESOLVED' && c.status === 'CLOSED_SUCCESS') ||
      (statusFilter === 'REJECTED' && c.status === 'CLOSED_REJECTED') ||
      (statusFilter === 'PENDING_APPROVAL' && c.status === 'AWAITING_APPROVAL');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
      case 'AWAITING_APPROVAL':
        return <span className="badge badge-warning">Awaiting Approval</span>;
      case 'APPROVED':
      case 'EXECUTING':
        return <span className="badge badge-info">Executing</span>;
      case 'RESOLVED':
      case 'CLOSED_SUCCESS':
        return <span className="badge badge-success">Resolved</span>;
      case 'REJECTED':
      case 'CLOSED_REJECTED':
        return <span className="badge badge-critical">Rejected</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.25rem' }}>Active Cases</h2>
        </div>
        <button
          onClick={onTriggerSimulation}
          disabled={isSimulating}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          {isSimulating ? 'Injecting...' : '+ Inject Anomaly'}
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search SKU, Title, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['ALL', 'PENDING_APPROVAL', 'EXECUTING', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === status ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === status ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {status === 'PENDING_APPROVAL' ? 'APPROVALS' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Case List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <Activity size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>No matching business cases</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="glass-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.12)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {c.sku}
                  </span>
                  {getStatusBadge(c.status)}
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {c.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} color="var(--accent-rose)" /> Z: {c.zScore}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <Clock size={12} /> {new Date(c.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
