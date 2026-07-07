import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, CheckCircle2, Terminal, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentActivityProps {
  currentStatus?: string;
  sku?: string;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({ currentStatus = 'DETECTED', sku = 'SKU-9942' }) => {
  const [isSimulating, setIsSimulating] = useState(true);
  const [chartData, setChartData] = useState<any[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      load: 10 + Math.random() * 20,
      confidence: 90 + Math.random() * 5,
    }))
  );
  const [metrics, setMetrics] = useState({
    nodes: 1429,
    latency: 1.84,
    confidence: 94.8
  });

  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      let newLoad = 10 + Math.random() * 20;
      let newConfidence = 90 + Math.random() * 5;

      if (currentStatus === 'INVESTIGATING' || currentStatus === 'EXECUTING') {
        newLoad = 70 + Math.random() * 30; // High load
        newConfidence = 75 + Math.random() * 10; // Lower confidence while investigating
      } else if (currentStatus === 'PLAN_GENERATED' || currentStatus === 'AWAITING_APPROVAL' || currentStatus === 'APPROVED') {
        newLoad = 30 + Math.random() * 20;
        newConfidence = 95 + Math.random() * 4; // High confidence when plan is ready
      } else if (currentStatus === 'CLOSED_SUCCESS') {
         newLoad = 10 + Math.random() * 10;
         newConfidence = 98 + Math.random() * 2;
      }

      setChartData(prev => {
        const newTime = prev[prev.length - 1].time + 1;
        return [...prev.slice(1), { time: newTime, load: newLoad, confidence: newConfidence }];
      });

      setMetrics(prev => ({
        nodes: prev.nodes + Math.floor(Math.random() * 3),
        latency: 1.84 + (Math.random() * 0.4 - 0.2),
        confidence: newConfidence
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, [currentStatus, isSimulating]);

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
    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="var(--text-primary)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>Autonomous Reasoning Pipeline</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time agentic workflow execution & decision synthesis</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`badge ${isSimulating ? 'badge-success' : 'badge-critical'}`} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', outline: 'none' }}
          >
            {isSimulating ? (
              <><Activity size={14} /> Swarm Active (Pause)</>
            ) : (
              <><Terminal size={14} /> Swarm Paused (Resume)</>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--text-primary)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Nodes Executed</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>{metrics.nodes.toLocaleString()}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>↑ 12.4% vs yesterday</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--border-focus)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mean Resolution Latency</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>{metrics.latency.toFixed(2)}s</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sub-2s SLA maintained</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--border-focus)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Confidence Score</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>{metrics.confidence.toFixed(1)}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High certainty threshold</span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--border-focus)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Tool Proxies</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '8px', display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>ERP-SAP</span>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>WMS-RED</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>2/2 Connected</span>
        </div>
      </div>

      {/* Reasoning Nodes Pipeline */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
          <Layers size={18} />
          <span>Agent Node Progression ({sku})</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative' }}>
          {/* Node 1: Detect */}
          <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Node 01</span>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>Anomaly Detection</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>Z-Score anomaly filtering (&gt; 2.5σ threshold) via real-time stream.</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>Status: Completed (14ms)</span>
          </div>

          {/* Node 2: Investigate */}
          <div style={{ padding: '16px', borderRadius: '8px', background: getNodeStatus('investigate') === 'active' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', border: getNodeStatus('investigate') === 'active' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Node 02</span>
              {getNodeStatus('investigate') === 'completed' ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Activity size={16} color="var(--text-primary)" className="animate-pulse-glow" />}
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>Root Cause Synthesis</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>Correlates WMS dock telemetry with ERP supplier transit lead times.</p>
            <span style={{ fontSize: '0.75rem', color: getNodeStatus('investigate') === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', marginTop: 'auto' }}>
              Status: {getNodeStatus('investigate') === 'completed' ? 'Completed (320ms)' : 'Synthesizing...'}
            </span>
          </div>

          {/* Node 3: Plan */}
          <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Node 03</span>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>Remediation Planning</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>Generates multi-action expedite &amp; stock reallocation strategy.</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>Status: Completed (480ms)</span>
          </div>

          {/* Node 4: Execute */}
          <div style={{ padding: '16px', borderRadius: '8px', background: getNodeStatus('execute') === 'active' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', border: getNodeStatus('execute') === 'active' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Node 04</span>
              {getNodeStatus('execute') === 'completed' ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <Zap size={16} color="var(--text-primary)" />}
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>Tool Proxy Dispatch</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>Dispatches approved action parameters to ERP/WMS ledgers.</p>
            <span style={{ fontSize: '0.75rem', color: getNodeStatus('execute') === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', marginTop: 'auto' }}>
              Status: {getNodeStatus('execute') === 'completed' ? 'Executed Successfully' : 'Awaiting Approval / Guardrail'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Reasoning Telemetry Graph */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
          <Activity size={18} />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Agent Compute Load &amp; Confidence Metric</h3>
        </div>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ fontSize: '0.85rem' }}
                formatter={(value: any) => typeof value === 'number' ? value.toFixed(1) : value}
              />
              <Area type="linear" dataKey="load" name="Compute Load (%)" stroke="var(--accent-amber)" fillOpacity={1} fill="url(#colorLoad)" />
              <Area type="linear" dataKey="confidence" name="Confidence Score (%)" stroke="var(--accent-emerald)" fillOpacity={1} fill="url(#colorConf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
