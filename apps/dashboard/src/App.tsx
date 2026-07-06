import { useState, useEffect, useCallback } from 'react';
import { fetchCases, fetchCaseDetail, approveCase, rejectCase, dispatchSimulationEvent, connectWebSocket, CaseItem, CaseDetailData } from './services/api';
import { CaseFeed } from './components/CaseFeed';
import { CaseDetail } from './components/CaseDetail';
import { AuditLog } from './components/AuditLog';
import { ExecutionStatus } from './components/ExecutionStatus';
import { AgentActivity } from './components/AgentActivity';
import { TelemetryStream } from './components/TelemetryStream';
import { Shield, Radio, RefreshCw } from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetailData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'activity' | 'telemetry'>('overview');

  const loadCases = useCallback(async () => {
    try {
      const list = await fetchCases();
      setCases(list);
      if (!selectedId && list.length > 0) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      console.error('[App] Failed to load cases:', err);
    }
  }, [selectedId]);

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

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      await dispatchSimulationEvent('SKU-9942');
      await loadCases();
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <header style={{ height: '64px', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)' }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SENTINEL <span style={{ fontWeight: 300, color: 'var(--accent-cyan)' }}>OS</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Autonomous Enterprise Mission Control</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', border: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
            <Radio size={14} color={isConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)'} className={isConnected ? 'animate-pulse-glow' : ''} />
            <span>{isConnected ? 'Live WMS Stream Connected' : 'Stream Offline / Polling'}</span>
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
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', padding: '20px', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <CaseFeed
          cases={cases}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onTriggerSimulation={handleTriggerSimulation}
          isSimulating={isSimulating}
        />

        {/* Right Main Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'overview' ? 'var(--accent-cyan)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Overview &amp; RCA
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'activity' ? 'var(--accent-violet)' : 'transparent', color: activeTab === 'activity' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Agent Activity
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'telemetry' ? 'var(--accent-emerald)' : 'transparent', color: activeTab === 'telemetry' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Telemetry Stream
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'audit' ? 'var(--accent-amber)' : 'transparent', color: activeTab === 'audit' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Audit Trail ({caseDetail?.auditTrail?.length || 0})
            </button>
          </div>

          {activeTab === 'overview' ? (
            <>
              <CaseDetail
                caseData={caseDetail}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
              {caseDetail && <ExecutionStatus status={caseDetail.status} version={caseDetail.version} />}
            </>
          ) : activeTab === 'activity' ? (
            <AgentActivity currentStatus={caseDetail?.status} sku={caseDetail?.sku} />
          ) : activeTab === 'telemetry' ? (
            <TelemetryStream />
          ) : (
            <AuditLog auditTrail={caseDetail?.auditTrail} />
          )}
        </div>
      </div>
    </div>
  );
}
