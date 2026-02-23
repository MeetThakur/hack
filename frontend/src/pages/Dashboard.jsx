import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, Droplets, ArrowUpRight, Download, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Client-side strain score calculator (mirrors backend logic)
function calcStrain(spending, revenueImpact, gdp) {
  const base = 40;
  const spendStrain = Math.abs(spending) * 5;
  const revStrain = Math.abs(Math.min(0, (revenueImpact / 100) * gdp)) * 3;
  return Math.min(100, Math.max(0, Math.round(base + spendStrain + revStrain)));
}

function riskLabel(score) {
  if (score > 70) return 'High Risk';
  if (score > 40) return 'Moderate Risk';
  return 'Low Risk';
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policy_id = searchParams.get('policy_id');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // What-if sliders
  const [whatIfSpending, setWhatIfSpending] = useState(null);
  const [whatIfRevenue, setWhatIfRevenue] = useState(null);

  useEffect(() => {
    if (!policy_id) { setError('No simulation found. Upload a policy first.'); return; }
    fetch(`http://127.0.0.1:8000/results/${policy_id}`)
      .then(r => r.json()).then(setData)
      .catch(() => setError('Failed to load results.'));
  }, [policy_id]);



  // Initialize sliders once data loads
  useEffect(() => {
    if (data?.breakdown) {
      setWhatIfSpending(data.breakdown.spending_commitment ?? 4.2);
      setWhatIfRevenue(data.breakdown.revenue_impact ?? -1.5);
    }
  }, [data]);

  const whatIfScore = useMemo(() => {
    if (whatIfSpending === null) return null;
    return calcStrain(whatIfSpending, whatIfRevenue, 18200);
  }, [whatIfSpending, whatIfRevenue]);

  if (error) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '6rem', gap: '1rem' }}>
        <AlertTriangle size={32} color="var(--text-tertiary)" />
        <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>Go to Upload</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '6rem', gap: '0.5rem' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
        <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Loading results...</p>
      </div>
    );
  }

  const { fiscal_strain_score, risk_category, projected_deficit_absolute, projected_deficit_increase, reserve_depletion_year, debt_to_gdp_projection = [], baseline_vs_stress = [], delta, early_warnings = [], breakdown = {} } = data;



  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Simulation Results</h1>
          <p style={{ margin: 0, marginTop: '0.125rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {policy_id}
          </p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: '0.75rem' }}
          onClick={() => { window.open(`http://127.0.0.1:8000/export/${policy_id}`, '_blank'); }}>
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Strain Score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.125rem', marginTop: '0.375rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em' }}>{fiscal_strain_score}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/100</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--bg-subtle)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${fiscal_strain_score}%`, height: '100%', borderRadius: '2px', background: fiscal_strain_score > 70 ? 'var(--red)' : fiscal_strain_score > 40 ? 'var(--amber)' : 'var(--green)', transition: 'width 0.5s' }}></div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Risk Level</p>
          <h3 style={{ margin: 0, marginTop: '0.375rem', fontSize: '1.25rem' }}>{risk_category}</h3>
          <div style={{ marginTop: '0.375rem' }}>
            {fiscal_strain_score > 70 ? <span className="badge badge-red">Critical</span> : fiscal_strain_score > 40 ? <span className="badge badge-yellow">Moderate</span> : <span className="badge badge-gray" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>Stable</span>}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Projected Deficit</p>
          <h3 style={{ margin: 0, marginTop: '0.375rem', fontSize: '1.25rem' }}>${projected_deficit_absolute}B</h3>
          <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.6875rem', color: projected_deficit_increase > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            <ArrowUpRight size={11} /> {projected_deficit_increase}%
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Reserve Depletion</p>
          <h3 style={{ margin: 0, marginTop: '0.375rem', fontSize: '1.25rem' }}>Year {reserve_depletion_year}</h3>
          <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.6875rem', color: reserve_depletion_year <= 3 ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>
            {reserve_depletion_year <= 3 ? 'Accelerated' : 'Within limits'}
          </p>
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.8125rem' }}>Debt-to-GDP Projection</h3>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{debt_to_gdp_projection[debt_to_gdp_projection.length - 1]?.ratio}%</span>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={debt_to_gdp_projection} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', boxShadow: 'var(--shadow)', background: '#1e1e1e', color: '#f5f5f5' }} />
                <Area type="monotone" dataKey="ratio" stroke="var(--accent)" strokeWidth={2} fill="url(#cR)" dot={{ r: 3, fill: '#141414', stroke: 'var(--accent)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.8125rem' }}>Baseline vs. Stress</h3>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: delta > 0 ? 'var(--red)' : 'var(--green)' }}>{delta > 0 ? '+' : ''}${delta}B</span>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={baseline_vs_stress} margin={{ top: 12, right: 0, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-tertiary)', fontWeight: 500 }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', boxShadow: 'var(--shadow)', background: '#1e1e1e', color: '#f5f5f5' }} />
                <Bar dataKey="baseline" fill="#2a2a2a" radius={[3, 3, 0, 0]} maxBarSize={28} name="Baseline" />
                <Bar dataKey="stress" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={28} name="Stress" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', color: 'var(--text-tertiary)' }}><span style={{ width: '6px', height: '6px', borderRadius: '1px', background: 'var(--border-color)', display: 'inline-block' }}></span> Baseline</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', color: 'var(--text-tertiary)' }}><span style={{ width: '6px', height: '6px', borderRadius: '1px', background: 'var(--accent)', display: 'inline-block' }}></span> Stress</span>
          </div>
        </div>
      </div>

      {/* ── What-If + Warnings ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {/* What-If Analysis */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <SlidersHorizontal size={14} /> What-If Analysis
          </h3>
          {whatIfSpending !== null && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Spending Commitment</label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>${whatIfSpending.toFixed(1)}B</span>
                </div>
                <input type="range" min="0" max="20" step="0.1" value={whatIfSpending} onChange={e => setWhatIfSpending(+e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue Impact</label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{whatIfRevenue.toFixed(1)}%</span>
                </div>
                <input type="range" min="-10" max="5" step="0.1" value={whatIfRevenue} onChange={e => setWhatIfRevenue(+e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Projected Score</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.125rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1, color: whatIfScore > 70 ? 'var(--red)' : whatIfScore > 40 ? 'var(--amber)' : 'var(--green)' }}>{whatIfScore}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/100</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${whatIfScore > 70 ? 'badge-red' : whatIfScore > 40 ? 'badge-yellow' : ''}`}
                    style={whatIfScore <= 40 ? { background: 'var(--green-light)', color: 'var(--green)' } : {}}>
                    {riskLabel(whatIfScore)}
                  </span>
                  {whatIfScore !== fiscal_strain_score && (
                    <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.6875rem', color: whatIfScore < fiscal_strain_score ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                      {whatIfScore < fiscal_strain_score ? '↓' : '↑'} {Math.abs(whatIfScore - fiscal_strain_score)} pts
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Warnings */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={14} /> Early Warnings
          </h3>
          {early_warnings.length > 0 ? early_warnings.map((w, i) => (
            <div key={i} className={`warning-item ${w.type === 'Liquidity' ? 'warning-item-red' : 'warning-item-yellow'}`} style={{ padding: '0.625rem' }}>
              <div style={{ background: w.type === 'Liquidity' ? 'var(--red-light)' : 'var(--amber-light)', padding: '0.25rem', borderRadius: '50%', height: 'fit-content' }}>
                {w.type === 'Liquidity' ? <Droplets size={14} color="var(--red)" /> : <TrendingDown size={14} color="var(--amber)" />}
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: '0.75rem' }}>{w.title}</h5>
                <p style={{ margin: 0, fontSize: '0.6875rem' }}>{w.description}</p>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', margin: 0 }}>No warnings detected.</p>
          )}
        </div>
      </div>


      {/* ── Extracted Parameters ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '0.8125rem' }}>Extracted Parameters</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Spending</p>
            <h3 style={{ margin: '0.125rem 0 0', fontSize: '1rem' }}>${breakdown.spending_commitment}B</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Revenue</p>
            <h3 style={{ margin: '0.125rem 0 0', fontSize: '1rem', color: breakdown.revenue_impact < 0 ? 'var(--red)' : 'var(--green)' }}>{breakdown.revenue_impact}%</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Duration</p>
            <h3 style={{ margin: '0.125rem 0 0', fontSize: '1rem' }}>{breakdown.duration}mo</h3>
          </div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Sectors</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
              {(breakdown.sectors || []).map((s, i) => <span key={i} className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/upload')}>← New Simulation</button>
      </div>
    </div>
  );
}
