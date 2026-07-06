import React, { useState, useEffect } from 'react';
import { Radio, BarChart2, ShieldAlert, Database, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export const TelemetryStream: React.FC = () => {
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
            return { ...item, stock: Math.max(0, item.stock + stockDelta) };
          }
          return item;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={24} color="var(--accent-emerald)" className="animate-pulse-glow" />
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>WMS Inventory Telemetry Stream</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Continuous IoT dock sensor ingestion &amp; ERP inventory ledger synchronization</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} /> Redis Stream Shard-01 Active
          </span>
        </div>
      </div>

      {/* Telemetry Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.08)', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inbound Receiving Rate</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {streamData.receivingRate} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>plt/hr</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowDownRight size={14} /> -18.4% vs baseline (Bottleneck)
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dock Turnaround Time</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {streamData.dockTurnaroundMins} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>mins</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <ArrowUpRight size={14} /> +18.2 mins above target SLA
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Safety Stock Buffer Health</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{streamData.safetyStockHealth}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <CheckCircle2 size={14} /> Global reserve equilibrium
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Monitored Hub Shards</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>4 / 4</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Alpha, Beta, Gamma, Delta</span>
        </div>
      </div>

      {/* Real-Time Anomaly Z-Score Monitor */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="var(--accent-cyan)" />
          <span>Statistical Anomaly Z-Score Distribution</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {skus.map((item) => (
            <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)' }}>{item.sku}</div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (item.zScore / 4.0) * 100)}%`,
                    background: item.zScore >= 2.5 ? 'var(--accent-rose)' : item.zScore >= 2.0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ width: '60px', textAlign: 'right', fontWeight: 700, color: item.zScore >= 2.5 ? 'var(--accent-rose)' : item.zScore >= 2.0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                {item.zScore.toFixed(2)}σ
              </div>
              <div style={{ width: '100px', textAlign: 'right' }}>
                <span className={item.status === 'CRITICAL' ? 'badge badge-critical' : item.status === 'HIGH' ? 'badge badge-warning' : item.status === 'WARNING' ? 'badge badge-warning' : 'badge badge-success'}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Inventory Ledger Snapshot */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--accent-amber)" />
          <span>ERP / WMS Live Ledger Status (Proxy Execution Targets)</span>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 8px' }}>SKU / Item Description</th>
                <th style={{ padding: '12px 8px' }}>Distribution Hub</th>
                <th style={{ padding: '12px 8px' }}>On-Hand Stock</th>
                <th style={{ padding: '12px 8px' }}>Reserved</th>
                <th style={{ padding: '12px 8px' }}>Reorder Point</th>
                <th style={{ padding: '12px 8px' }}>Ledger Health</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((item) => {
                const isStockoutRisk = item.stock <= item.reorder;
                return (
                  <tr key={item.sku} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <strong style={{ color: '#fff', fontFamily: 'monospace', marginRight: '8px' }}>{item.sku}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{item.hub}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: isStockoutRisk ? 'var(--accent-rose)' : '#fff' }}>{item.stock}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{item.reserved}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{item.reorder}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {isStockoutRisk ? (
                        <span style={{ color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={14} /> Stockout Risk
                        </span>
                      ) : (
                        <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
