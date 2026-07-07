import React, { useState } from 'react';
import { CaseItem } from '../services/api';
import { Search, AlertTriangle, Activity, Clock, Layers } from 'lucide-react';

interface CaseFeedProps {
  cases: CaseItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTriggerSimulation: () => void;
  isInjecting: boolean;
  fetchLimit: number;
  onSetFetchLimit: (limit: number) => void;
  globalTotal: number;
  globalPending: number;
}

export const CaseFeed: React.FC<CaseFeedProps> = ({
  cases,
  selectedId,
  onSelect,
  onTriggerSimulation,
  isInjecting,
  fetchLimit,
  onSetFetchLimit,
  globalTotal,
  globalPending,
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
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '12px 24px', gap: '24px', height: '100%' }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--text-primary)' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Active Anomalies</h3>
          <p style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 600 }}>{globalTotal}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-rose)' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 600 }}>{globalPending}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--text-secondary)' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>System Status</h3>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '8px' }}>Live Monitoring <span className="animate-pulse-glow" style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--text-primary)', borderRadius: '50%', marginLeft: '8px' }}></span></p>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Active Cases Overview</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <button
                onClick={() => onSetFetchLimit(20)}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', background: fetchLimit === 20 ? 'var(--text-primary)' : 'transparent', color: fetchLimit === 20 ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s', border: 'none', borderRight: '1px solid var(--border-subtle)' }}
              >
                Top 20
              </button>
              <button
                onClick={() => onSetFetchLimit(1000)}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', background: fetchLimit === 1000 ? 'var(--text-primary)' : 'transparent', color: fetchLimit === 1000 ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s', border: 'none' }}
              >
                Full History
              </button>
            </div>
            <button
              onClick={onTriggerSimulation}
              disabled={isInjecting}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              {isInjecting ? 'Injecting...' : '+ Inject Single Anomaly'}
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search SKU, Title, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {['ALL', 'PENDING_APPROVAL', 'EXECUTING', 'RESOLVED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: statusFilter === status ? 'var(--text-primary)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  background: statusFilter === status ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                  color: statusFilter === status ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'PENDING_APPROVAL' ? 'APPROVALS' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Case List - Full Width Table Style */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--text-muted)' }}>
              <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontSize: '1.1rem' }}>No anomalies detected matching your criteria.</p>
            </div>
          ) : (
            filtered.map((c, index) => {
              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="glass-card animate-slide-up"
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '1fr 3fr 1fr 1fr auto',
                    gap: '16px',
                    alignItems: 'center',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-tertiary)',
                    animationDelay: `${index * 0.05}s`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.sku}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{c.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <AlertTriangle size={14} color="var(--accent-rose)" /> Z-Score: {c.zScore} | {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>{getStatusBadge(c.status)}</div>
                  <div>
                    <span className="badge badge-critical" style={{ background: 'transparent', border: '1px solid' }}>{c.severity}</span>
                  </div>
                  <div>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--text-primary)' }}>
                      Deep Dive &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
