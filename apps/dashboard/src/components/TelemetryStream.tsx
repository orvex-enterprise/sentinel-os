import React, { useState, useEffect } from 'react';
import { Radio, BarChart2, ShieldAlert, Database, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface TelemetryStreamProps {
  activeSku?: string;
  activeZScore?: number;
}

export const TelemetryStream: React.FC<TelemetryStreamProps> = ({ activeSku, activeZScore }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [streamData, setStreamData] = useState({
    receivingRate: 42.5,
    dockTurnaroundMins: 48.2,
    safetyStockHealth: 88.4,
    activeStreams: 4,
  });

  const [skus, setSkus] = useState([
    { sku: 'SKU-9942', name: 'Micro-Controller Unit (MCU-32)', hub: 'WH-ALPHA-01', stock: 120, reserved: 95, reorder: 200, zScore: 3.84, status: 'CRITICAL' },
    { sku: 'SKU-3101', name: 'Lithium Battery Pack (48V-10Ah)', hub: 'WH-BETA-02', stock: 45, reserved: 40, reorder: 100, zScore: 2.85, status: 'HIGH' },
    { sku: 'SKU-7821', name: 'Thermal Sensor Array (TS-09)', hub: 'WH-GAMMA-03', stock: 850, reserved: 320, reorder: 500, zScore: 1.12, status: 'NORMAL' },
    { sku: 'SKU-4410', name: 'Hydraulic Valve Actuator (HVA-2)', hub: 'WH-ALPHA-01', stock: 1420, reserved: 410, reorder: 600, zScore: 0.45, status: 'NORMAL' },
    { sku: 'SKU-8829', name: 'Power Inverter Module (PIM-500)', hub: 'WH-DELTA-04', stock: 310, reserved: 290, reorder: 350, zScore: 2.15, status: 'WARNING' },
  ]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setStreamData((prev) => ({
        ...prev,
        receivingRate: +(prev.receivingRate + (Math.random() * 2 - 1)).toFixed(1),
        dockTurnaroundMins: +(prev.dockTurnaroundMins + (Math.random() * 1.5 - 0.75)).toFixed(1),
      }));

      setSkus((prev) =>
        prev.map((item) => {
          if (item.status === 'NORMAL') {
            const stockDelta = Math.floor(Math.random() * 5 - 2);
            const newZ = item.zScore + (Math.random() * 0.4 - 0.2);
            return { ...item, stock: Math.max(0, item.stock + stockDelta), zScore: Math.min(2.4, Math.max(0.1, newZ)) };
          } else if (item.status === 'CRITICAL') {
            const newZ = item.zScore + (Math.random() * 0.4 - 0.2);
            return { ...item, zScore: Math.max(3.0, newZ) };
          }
          return item;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    // If activeSku is provided, ensure it's in the list for the chart
    if (activeSku) {
      setSkus(prev => {
        if (!prev.find(s => s.sku === activeSku)) {
           return [{ sku: activeSku, name: 'Active Case Anomaly', hub: 'DYNAMIC-HUB', stock: 0, reserved: 0, reorder: 0, zScore: activeZScore || 4.2, status: 'CRITICAL' }, ...prev.slice(0, 4)];
        }
        return prev.map(s => s.sku === activeSku ? { ...s, zScore: activeZScore || Math.max(3.8, s.zScore), status: 'CRITICAL' } : { ...s, status: 'NORMAL' });
      });
    }
  }, [activeSku, activeZScore]);

  return (
    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={24} color="var(--text-primary)" className="animate-pulse-glow" />
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>WMS Inventory Telemetry Stream</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Continuous IoT dock sensor ingestion &amp; ERP inventory ledger synchronization</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`badge ${isSimulating ? 'badge-info' : 'badge-critical'}`} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', outline: 'none' }}
          >
            <Database size={14} /> {isSimulating ? 'Redis Stream Active (Pause)' : 'Redis Stream Paused (Simulate)'}
          </button>
        </div>
      </div>

      {/* Telemetry Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inbound Receiving Rate</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {streamData.receivingRate} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>plt/hr</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowDownRight size={14} /> -18.4% vs baseline (Bottleneck)
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dock Turnaround Time</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {streamData.dockTurnaroundMins} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>mins</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowUpRight size={14} /> +18.2 mins above target SLA
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--text-primary)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safety Stock Buffer Health</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>{streamData.safetyStockHealth}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <CheckCircle2 size={14} /> Global reserve equilibrium
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--border-focus)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Monitored Hub Shards</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>4 / 4</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alpha, Beta, Gamma, Delta</span>
        </div>
      </div>

      {/* Real-Time Anomaly Z-Score Monitor Graph */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
          <BarChart2 size={18} />
          <span>Statistical Anomaly Z-Score Distribution</span>
        </h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skus} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="sku" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--border-subtle)', opacity: 0.4 }}
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}
                formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) + 'σ' : val}
              />
              <Bar dataKey="zScore" name="Z-Score (σ)" radius={[4, 4, 0, 0]}>
                {skus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.sku === activeSku ? 'var(--accent-rose)' : entry.zScore > 2.5 ? 'var(--accent-amber)' : 'var(--text-muted)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Inventory Ledger Snapshot */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
          <ShieldAlert size={18} />
          <span>ERP / WMS Live Ledger Status (Proxy Execution Targets)</span>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>SKU / Item Description</th>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>Distribution Hub</th>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>On-Hand Stock</th>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>Reserved</th>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>Reorder Point</th>
                <th style={{ padding: '14px 10px', fontWeight: 500 }}>Ledger Health</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((item) => {
                const isStockoutRisk = item.stock <= item.reorder;
                return (
                  <tr key={item.sku} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px 10px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', marginRight: '8px', fontWeight: 500 }}>{item.sku}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '16px 10px', color: 'var(--text-secondary)' }}>{item.hub}</td>
                    <td style={{ padding: '16px 10px', fontWeight: 600, color: isStockoutRisk ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{item.stock}</td>
                    <td style={{ padding: '16px 10px', color: 'var(--text-secondary)' }}>{item.reserved}</td>
                    <td style={{ padding: '16px 10px', color: 'var(--text-muted)' }}>{item.reorder}</td>
                    <td style={{ padding: '16px 10px' }}>
                      {isStockoutRisk ? (
                        <span style={{ color: 'var(--accent-rose)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={14} /> Stockout Risk
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} /> Normal Buffer
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
