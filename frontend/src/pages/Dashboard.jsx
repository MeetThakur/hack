import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DownloadCloud, SlidersHorizontal, AlertTriangle, TrendingDown, Building, Droplets, Calendar, ArrowUpRight } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const policy_id = searchParams.get('policy_id') || 'mock-policy-123';
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/results/${policy_id}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => {
        console.error(err);
        setData({});
      });
  }, [policy_id]);

  if (!data) {
    return <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading Simulation Results...</div>;
  }

  const {
      fiscal_strain_score = 72,
      risk_category = "High Risk",
      projected_deficit_absolute = 4.2,
      projected_deficit_increase = 8.5,
      reserve_depletion_year = 3,
      debt_to_gdp_projection = [
          { year: '2024', ratio: 64.1 },
          { year: '2025', ratio: 65.2 },
          { year: '2026', ratio: 66.8 },
          { year: '2027', ratio: 68.1 },
          { year: '2028', ratio: 68.4 }
        ],
      baseline_vs_stress = [
          { name: 'REVENUE', baseline: 12.4, stress: 12.0 },
          { name: 'EXPENSE', baseline: 11.2, stress: 14.1 },
          { name: 'DEFICIT', baseline: 4.0, stress: 6.8 },
          { name: 'DEBT LOAD', baseline: 65.0, stress: 68.4 }
        ],
      delta = -12.5,
      early_warnings = [],
      breakdown = {
          spending_commitment: 4.2,
          revenue_impact: -1.5,
          duration: 60,
          sectors: ["Social Welfare", "Treasury"],
          metrics: []
      }
  } = data || {};

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0 }}>Universal Basic Income Pilot - Model B</h1>
            <span className="badge badge-gray">v2.4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            <Calendar size={14} /> Simulation ID: #FS-2024-892 • Last run: Oct 24, 2024
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => alert("Assumptions modification panel coming soon!")}><SlidersHorizontal size={16} /> Modify Assumptions</button>
          <button className="btn btn-primary" onClick={() => alert("Export functionality coming soon. The PDF will be downloaded.")}><DownloadCloud size={16} /> Export Report</button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h5 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Fiscal Strain Score</h5>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{fiscal_strain_score}</span>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</span>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
             <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
               <div style={{ width: `${fiscal_strain_score}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', height: '100%' }}></div>
             </div>
             <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 500 }}>{fiscal_strain_score > 50 ? '+' : '-'}{Math.abs(fiscal_strain_score - 40)}% from baseline</p>
          </div>
        </div>

        <div className="card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <h5 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Risk Category</h5>
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{risk_category}</h2>
            {fiscal_strain_score > 70 && <span className="badge badge-red" style={{ marginTop: '0.5rem' }}>Critical Threshold Breached</span>}
            {fiscal_strain_score <= 70 && fiscal_strain_score > 40 && <span className="badge badge-yellow" style={{ marginTop: '0.5rem' }}>Monitor Carefully</span>}
            {fiscal_strain_score <= 40 && <span className="badge badge-gray" style={{ marginTop: '0.5rem', background: '#dcfce7', color: '#16a34a' }}>Stable Outlook</span>}
          </div>
          <AlertTriangle size={80} color="var(--accent-red-light)" style={{ position: 'absolute', right: '-10px', top: '30px', zIndex: 0 }} />
          <p style={{ margin: 0, marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
            {risk_category === "High Risk" ? "Requires immediate mitigation plan" : risk_category === "Moderate Risk" ? "Requires careful balancing" : "Safe to proceed"}
          </p>
        </div>

        <div className="card stat-card">
          <h5 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Projected Deficit</h5>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>${projected_deficit_absolute}B</h2>
            <TrendingDown size={40} color="var(--border-color)" />
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: projected_deficit_increase > 0 ? 'var(--accent-red)' : '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               <ArrowUpRight size={14} /> {projected_deficit_increase}% expected change
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>Based on current revenue models</p>
          </div>
        </div>

        <div className="card stat-card">
          <h5 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Reserve Depletion</h5>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Year {reserve_depletion_year}</h2>
            <Building size={40} color="var(--accent-blue-light)" />
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: reserve_depletion_year <= 3 ? 'var(--warning-yellow)' : '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               {reserve_depletion_year <= 3 ? '▲ Faster than predicted' : '▼ Within safe limits'}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>Based on calculated burn rate</p>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="dashboard-grid">
        <div className="card dashboard-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0 }}>5-Year Debt-to-GDP Projection</h3>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Forecasted debt ratio under current policy parameters</p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <h2 style={{ margin: 0 }}>{debt_to_gdp_projection[debt_to_gdp_projection.length - 1]?.ratio || 0}%</h2>
               <p style={{ margin: 0, fontSize: '0.75rem' }}>Peak Debt ({debt_to_gdp_projection[debt_to_gdp_projection.length - 1]?.year || '5 Years'})</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={debt_to_gdp_projection} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} dy={10} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: 'var(--accent-blue)', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ratio" 
                  stroke="var(--accent-blue)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRatio)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent-blue)' }}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: 'var(--accent-blue)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card dashboard-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0 }}>Baseline vs. Stress Scenarios</h3>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Fiscal Year 2025 Variance Analysis</p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <h2 style={{ margin: 0, color: delta < 0 ? '#16a34a' : 'var(--accent-red)' }}>{delta > 0 ? '+' : ''}${delta}B</h2>
               <p style={{ margin: 0, fontSize: '0.75rem' }}>Net Variance</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={baseline_vs_stress} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontWeight: 500 }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="baseline" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="stress" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e2e8f0' }}></div> Baseline
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div> Stress Scenario
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '1.125rem' }}>
             <AlertTriangle size={20} /> Early Warning Signals
           </h3>
           {early_warnings.length > 0 ? early_warnings.map((warning, idx) => (
               <div key={idx} className={`warning-item ${warning.type === 'Liquidity' ? 'warning-item-red' : 'warning-item-yellow'}`}>
                 <div style={{ background: warning.type === 'Liquidity' ? 'var(--accent-red-light)' : 'var(--warning-yellow-light)', padding: '0.5rem', borderRadius: '50%', height: 'fit-content' }}>
                   {warning.type === 'Liquidity' ? <Droplets size={20} color="var(--accent-red)" /> : <TrendingDown size={20} color="var(--warning-yellow)" />}
                 </div>
                 <div>
                   <h5 style={{ margin: 0, marginBottom: '0.25rem' }}>{warning.title}</h5>
                   <p style={{ margin: 0, fontSize: '0.875rem' }}>{warning.description}</p>
                 </div>
               </div>
           )) : (
             <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No critical early warnings detected.</p>
           )}
        </div>

        <div>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '1.125rem' }}>
             <Building size={20} /> Simulation Parameters & Breakdown
           </h3>
           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
             <div style={{ display: 'flex', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', gap: '2rem' }}>
                <div style={{ flex: 1, borderRight: '1px solid var(--border-color)' }}>
                   <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Spending Commitment</p>
                   <h3 style={{ margin: '0.25rem 0' }}>${breakdown.spending_commitment}B</h3>
                   <p style={{ margin: 0, fontSize: '0.75rem' }}>Per annum base</p>
                </div>
                <div style={{ flex: 1, borderRight: '1px solid var(--border-color)' }}>
                   <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Revenue Impact</p>
                   <h3 style={{ margin: '0.25rem 0', color: breakdown.revenue_impact < 0 ? 'var(--accent-red)' : '#16a34a' }}>{breakdown.revenue_impact}%</h3>
                   <p style={{ margin: 0, fontSize: '0.75rem' }}>Tax Base Variance</p>
                </div>
                <div style={{ flex: 1, borderRight: '1px solid var(--border-color)' }}>
                   <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Duration</p>
                   <h3 style={{ margin: '0.25rem 0' }}>{breakdown.duration} Mos</h3>
                   <p style={{ margin: 0, fontSize: '0.75rem' }}>Policy Lifecycle</p>
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Primary Sectors</p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      {breakdown.sectors.map((s, idx) => (
                        <span key={idx} className="badge badge-gray">{s}</span>
                      ))}
                   </div>
                </div>
             </div>
             
             <table className="data-table">
               <thead>
                 <tr>
                   <th>Metric Category</th>
                   <th>Baseline</th>
                   <th>Stress Test</th>
                   <th>Delta</th>
                 </tr>
               </thead>
               <tbody>
                 {breakdown.metrics && breakdown.metrics.map((m, idx) => (
                 <tr key={idx}>
                   <td style={{ fontWeight: 500 }}>{m.category}</td>
                   <td>{m.baseline}</td>
                   <td>{m.stress}</td>
                   <td className={m.delta && m.delta.startsWith('+') ? "text-red" : ""}>{m.delta}</td>
                 </tr>
                 ))}
               </tbody>
             </table>
             
             <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); alert("Opening detailed ledger..."); }}>View Full Detailed Ledger</a>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
