import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, CheckCircle2, Terminal, Layers } from 'lucide-react';

interface AgentActivityProps {
  currentStatus?: string;
  sku?: string;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({ currentStatus = 'DETECTED', sku = 'SKU-9942' }) => {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [agent:monitor:v1] Initialized continuous telemetry scan across 4 distribution hubs...`,
    `[${new Date().toLocaleTimeString()}] [agent:detect:v1] Evaluated 14,200 SKUs against historical seasonal baseline.`,
    `[${new Date().toLocaleTimeString()}] [agent:detect:v1] Statistical anomaly detected on ${sku} (Z-Score > 2.5σ). Triggering investigation node.`,
    `[${new Date().toLocaleTimeString()}] [agent:investigate:v1] Correlating WMS receiving dock sensors with ERP purchase order transit schedules...`,
    `[${new Date().toLocaleTimeString()}] [agent:investigate:v1] Hypothesis synthesized: 94.2% stockout probability due to carrier bottleneck.`,
    `[${new Date().toLocaleTimeString()}] [agent:plan:v1] Formulating multi-action remediation plan with risk tiering and cost analysis...`,
    `[${new Date().toLocaleTimeString()}] [agent:plan:v1] Execution plan generated ($4,250 est. impact). Requesting human-in-the-loop approval.`,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const actions = [
        `[${timestamp}] [agent:monitor:v1] Polling WMS Redis stream shard-01 (latency: 12ms)...`,
        `[${timestamp}] [agent:detect:v1] Z-Score equilibrium verified for 14,199 SKUs.`,
        `[${timestamp}] [agent:proxy:v1] Verifying ERP-SAP-PROD OAuth2 token validity...`,
        `[${timestamp}] [agent:plan:v1] Re-evaluating contingency routing pathways from Hub Beta...`,
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setLogs((prev) => [...prev.slice(-15), randomAction]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const getNodeStatus = (nodeName: string) => {
    if (currentStatus === 'CLOSED_SUCCESS' || currentStatus === 'RESOLVED') return 'completed';
    if (currentStatus === 'EXECUTING' && nodeName !== 'execute') return 'completed';
    if (currentStatus === 'EXECUTING' && nodeName === 'execute') return 'active';
    if ((currentStatus === 'AWAITING_APPROVAL' || currentStatus === 'PENDING_APPROVAL' || currentStatus === 'APPROVED') && nodeName === 'plan') return 'completed';
    if ((currentStatus === 'AWAITING_APPROVAL' || currentStatus === 'PENDING_APPROVAL' || currentStatus === 'APPROVED') && nodeName === 'execute') return 'pending';
    if (currentStatus === 'INVESTIGATING' && nodeName === 'detect') return 'completed';
    if (currentStatus === 'INVESTIGATING' && nodeName === 'investigate') return 'active';
    return 'completed';
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Autonomous Reasoning Pipeline</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time agentic workflow execution & decision synthesis</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Swarm Active
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Nodes Executed</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>1,429</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>↑ 12.4% vs yesterday</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.08)', borderLeft: '4px solid var(--accent-violet)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mean Resolution Latency</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>1.84s</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Sub-2s SLA maintained</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Confidence Score</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>94.8%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>High certainty threshold</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Tool Proxies</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '8px', display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>ERP-SAP</span>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>WMS-RED</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>2/2 Connected</span>
        </div>
      </div>

      {/* Reasoning Nodes Pipeline */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-violet)" />
          <span>Agent Node Progression ({sku})</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative' }}>
          {/* Node 1: Detect */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>Node 01</span>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>Anomaly Detection</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Z-Score anomaly filtering (&gt; 2.5σ threshold) via real-time stream.</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: 'auto' }}>Status: Completed (14ms)</span>
          </div>

          {/* Node 2: Investigate */}
          <div style={{ padding: '16px', borderRadius: '12px', background: getNodeStatus('investigate') === 'active' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)', border: getNodeStatus('investigate') === 'active' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-violet)', textTransform: 'uppercase' }}>Node 02</span>
              {getNodeStatus('investigate') === 'completed' ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Activity size={16} color="var(--accent-cyan)" className="animate-pulse-glow" />}
            </div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>Root Cause Synthesis</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Correlates WMS dock telemetry with ERP supplier transit lead times.</p>
            <span style={{ fontSize: '0.75rem', color: getNodeStatus('investigate') === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-cyan)', marginTop: 'auto' }}>
              Status: {getNodeStatus('investigate') === 'completed' ? 'Completed (320ms)' : 'Synthesizing...'}
            </span>
          </div>

          {/* Node 3: Plan */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Node 03</span>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>Remediation Planning</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Generates multi-action expedite &amp; stock reallocation strategy.</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: 'auto' }}>Status: Completed (480ms)</span>
          </div>

          {/* Node 4: Execute */}
          <div style={{ padding: '16px', borderRadius: '12px', background: getNodeStatus('execute') === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: getNodeStatus('execute') === 'active' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>Node 04</span>
              {getNodeStatus('execute') === 'completed' ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Zap size={16} color="var(--accent-amber)" />}
            </div>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>Tool Proxy Dispatch</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Dispatches approved action parameters to ERP/WMS ledgers.</p>
            <span style={{ fontSize: '0.75rem', color: getNodeStatus('execute') === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: 'auto' }}>
              Status: {getNodeStatus('execute') === 'completed' ? 'Executed Successfully' : 'Awaiting Approval / Guardrail'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Reasoning Terminal */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(11, 15, 25, 0.9)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          <Terminal size={18} />
          <h3>Live Agent Reasoning Stream &amp; Swarm Telemetry</h3>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.7', color: 'var(--text-primary)', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ color: log.includes('detect') ? 'var(--accent-cyan)' : log.includes('investigate') ? 'var(--accent-violet)' : log.includes('plan') ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
