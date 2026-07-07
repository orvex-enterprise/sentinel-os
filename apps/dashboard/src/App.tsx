import { useState, useEffect, useCallback } from 'react';
import { fetchCases, fetchCaseDetail, approveCase, rejectCase, dispatchSimulationEvent, setSimulationState, connectWebSocket, CaseItem, CaseDetailData } from './services/api';
import { CaseFeed } from './components/CaseFeed';
import { CaseDetail } from './components/CaseDetail';
import { AuditLog } from './components/AuditLog';
import { ExecutionStatus } from './components/ExecutionStatus';
import { AgentActivity } from './components/AgentActivity';
import { TelemetryStream } from './components/TelemetryStream';
import { Shield, Radio, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetailData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isSwarmActive, setIsSwarmActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'activity' | 'telemetry'>('overview');
  const [fetchLimit, setFetchLimit] = useState(20);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalPending, setGlobalPending] = useState(0);

  const loadCases = useCallback(async () => {
    try {
      const result = await fetchCases(fetchLimit);
      setCases(result.cases);
      setGlobalTotal(result.total);
      setGlobalPending(result.pendingTotal);
    } catch (err) {
      console.error('[App] Failed to load cases:', err);
    }
  }, [fetchLimit]);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const detail = await fetchCaseDetail(id);
      setCaseDetail(detail);
    } catch (err) {
      console.error(`[App] Failed to load detail for ${id}:`, err);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    }
  }, [selectedId, loadDetail]);

  useEffect(() => {
    const ws = connectWebSocket((data) => {
      console.log('[WebSocket] State update received:', data);
      loadCases();
      if (data.newStatus === 'DETECTED') {
        toast.error(`Anomaly Detected: Case ${data.caseId}`, { icon: '🚨' });
      } else if (data.newStatus === 'AWAITING_APPROVAL') {
        toast.custom((t) => (
          <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-amber)' }}>
            <strong>Action Required</strong><br />
            <span style={{ fontSize: '0.85rem' }}>Plan generated for {data.caseId}</span>
          </div>
        ));
      } else if (data.newStatus === 'CLOSED_SUCCESS') {
        toast.success(`Execution successful: ${data.caseId}`, { icon: '✅' });
      }

      if (selectedId && (data.caseId === selectedId || !selectedId)) {
        loadDetail(selectedId || data.caseId);
      }
    });

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [loadCases, loadDetail, selectedId]);

  const handleApprove = async (comment?: string) => {
    if (!selectedId) return;
    setIsProcessing(true);
    try {
      await approveCase(selectedId, caseDetail?.approvalToken || '', comment);
      await loadDetail(selectedId);
      await loadCases();
    } catch (err: any) {
      alert(`Approval Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedId) return;
    setIsProcessing(true);
    try {
      await rejectCase(selectedId, reason);
      await loadDetail(selectedId);
      await loadCases();
    } catch (err: any) {
      alert(`Rejection Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync UI state with backend simulation engine
  useEffect(() => {
    setSimulationState(isSwarmActive).catch(err => console.error('[App] Failed to sync simulation state:', err));
  }, [isSwarmActive]);

  const handleTriggerSimulation = async () => {
    setIsInjecting(true);
    try {
      const { caseId } = await dispatchSimulationEvent();
      toast.success(`Demo anomaly injected! Initiating swarm resolution for Case ${caseId}...`, { icon: '🤖' });
      await loadCases();
    } catch (err: any) {
      toast.error(`Simulation failed: ${err.message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }} className="animate-fade-in">
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' } }} />
      {/* Top Navigation Bar */}
      <header style={{ height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="var(--bg-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              SENTINEL <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>OS</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Autonomous Enterprise Mission Control</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '9999px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
            <Radio size={14} color={isConnected ? 'var(--text-primary)' : 'var(--text-muted)'} className={isConnected ? 'animate-pulse-glow' : ''} />
            <span style={{ color: isConnected ? 'var(--text-primary)' : 'var(--text-muted)' }}>{isConnected ? 'Live WMS Stream Connected' : 'Stream Offline / Polling'}</span>
          </div>

          <button
            onClick={() => {
              loadCases();
              if (selectedId) loadDetail(selectedId);
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} /> Sync
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {!selectedId ? (
          // Overview Mode
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <CaseFeed
              cases={cases}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onTriggerSimulation={handleTriggerSimulation}
              isInjecting={isInjecting}
              isSwarmActive={isSwarmActive}
              setIsSwarmActive={setIsSwarmActive}
              fetchLimit={fetchLimit}
              onSetFetchLimit={setFetchLimit}
              globalTotal={globalTotal}
              globalPending={globalPending}
            />
          </div>
        ) : (
          // Deep Dive Mode
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <button
                onClick={() => setSelectedId(null)}
                className="btn-primary"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                &larr; Back to Overview
              </button>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid', borderColor: activeTab === 'overview' ? 'var(--border-subtle)' : 'transparent', background: activeTab === 'overview' ? 'var(--bg-tertiary)' : 'transparent', color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Overview &amp; RCA
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid', borderColor: activeTab === 'activity' ? 'var(--border-subtle)' : 'transparent', background: activeTab === 'activity' ? 'var(--bg-tertiary)' : 'transparent', color: activeTab === 'activity' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Agent Activity
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid', borderColor: activeTab === 'telemetry' ? 'var(--border-subtle)' : 'transparent', background: activeTab === 'telemetry' ? 'var(--bg-tertiary)' : 'transparent', color: activeTab === 'telemetry' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Telemetry Stream
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid', borderColor: activeTab === 'audit' ? 'var(--border-subtle)' : 'transparent', background: activeTab === 'audit' ? 'var(--bg-tertiary)' : 'transparent', color: activeTab === 'audit' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Audit Trail ({caseDetail?.auditTrail?.length || 0})
                </button>
              </div>
            </div>

            {activeTab === 'overview' ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <CaseDetail
                  caseData={caseDetail}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={isProcessing}
                />
                {caseDetail && <ExecutionStatus status={caseDetail.status} version={caseDetail.version} />}
              </div>
            ) : activeTab === 'activity' ? (
              <div className="animate-fade-in">
                <AgentActivity 
                  currentStatus={caseDetail?.status} 
                  sku={caseDetail?.sku} 
                  isSwarmActive={isSwarmActive} 
                  setIsSwarmActive={setIsSwarmActive} 
                />
              </div>
            ) : activeTab === 'telemetry' ? (
              <div className="animate-fade-in">
                <TelemetryStream 
                  activeSku={caseDetail?.sku} 
                  activeZScore={caseDetail?.zScore} 
                  isSwarmActive={isSwarmActive} 
                  setIsSwarmActive={setIsSwarmActive} 
                />
              </div>
            ) : (
              <div className="animate-fade-in">
                <AuditLog auditTrail={caseDetail?.auditTrail || []} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
