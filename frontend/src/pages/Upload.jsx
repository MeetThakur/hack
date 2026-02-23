import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, FileType2, CheckCircle, Loader, ArrowRight, DollarSign, TrendingDown, Clock, Layers, Settings2, Sparkles, Shield, Zap } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [policyId, setPolicyId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [debt, setDebt] = useState('');
  const [gdp, setGdp] = useState('');
  const [deficit, setDeficit] = useState('');

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://127.0.0.1:8000/analyze-policy', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setPolicyId(data.policy_id);
      setExtractedData(data.extracted_data);
      const ed = data.extracted_data;
      setDebt(String(ed.baseline_debt ?? 24500));
      setGdp(String(ed.baseline_gdp ?? 18200));
      setDeficit(String(ed.current_deficit ?? 5.4));
      setStep(2);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: policyId,
          baseline_debt: parseFloat(String(debt).replace(/,/g, '')),
          baseline_gdp: parseFloat(String(gdp).replace(/,/g, '')),
          current_deficit: parseFloat(String(deficit).replace(/,/g, ''))
        })
      });
      if (!res.ok) throw new Error("Simulation failed");
      const simData = await res.json();
      navigate(`/dashboard?policy_id=${policyId}`);
    } catch (err) { alert(err.message); }
    finally { setSimLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Step indicator bar */}
      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
            {step > 1 ? <CheckCircle size={12} /> : '1'}
          </div>
          <span style={{ fontWeight: step === 1 ? 600 : 400, color: step === 1 ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: '0.75rem' }}>Upload & Parse</span>
        </div>
        <div style={{ width: '60px', height: '2px', background: step >= 2 ? 'var(--accent)' : 'var(--border-color)', alignSelf: 'center', borderRadius: '1px' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step >= 2 ? 'var(--accent-gradient)' : 'var(--bg-subtle)', color: step >= 2 ? '#1a1a1a' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, border: step >= 2 ? 'none' : '1px solid var(--border-color)' }}>2</div>
          <span style={{ fontWeight: step === 2 ? 600 : 400, color: step === 2 ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: '0.75rem' }}>Review & Simulate</span>
        </div>
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', maxWidth: '960px', width: '100%', alignItems: 'center' }}>
            {/* Left: Upload area */}
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>Upload Policy<br /><span style={{ color: 'var(--accent)' }}>Document</span></h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Our AI extracts fiscal parameters and economic assumptions automatically. Supports PDF, CSV, and JSON.
              </p>

              <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ position: 'relative', padding: '2rem', textAlign: 'center', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}>
                  <input type="file" accept=".pdf,.csv,.json,.txt"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => setFile(e.target.files[0])} />
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <UploadCloud size={24} color="var(--accent)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>Drag and drop here</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>or click to browse</p>
                </div>
                {file && (
                  <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-light)' }}>
                    <FileType2 size={16} color="var(--accent)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--accent)' }}>{file.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-full" onClick={handleAnalyze} disabled={loading || !file} style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                {loading ? <><Loader size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Extracting data...</> : <><Sparkles size={14} /> Upload & Extract</>}
              </button>
            </div>

            {/* Right: Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={18} color="var(--accent)" />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.8125rem' }}>AI-Powered Extraction</h5>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automatically extracts spending, revenue impact, duration, sectors, and economic baseline from your document.</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={18} color="var(--red)" />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.8125rem' }}>Deterministic Simulation</h5>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5-year fiscal projection with debt-to-GDP trajectories, deficit forecasts, and reserve depletion analysis.</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={18} color="var(--green)" />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.8125rem' }}>Risk Assessment</h5>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fiscal strain scoring, early warning signals, and AI-generated mitigation recommendations.</p>
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  Supported formats: <span style={{ color: 'var(--accent)' }}>PDF</span> • <span style={{ color: 'var(--accent)' }}>CSV</span> • <span style={{ color: 'var(--accent)' }}>JSON</span> • <span style={{ color: 'var(--accent)' }}>TXT</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && extractedData && (
        <div style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
          {/* Success banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', borderRadius: 'var(--radius)', background: 'var(--green-light)', marginBottom: '1rem' }}>
            <CheckCircle size={16} color="var(--green)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--green)', fontWeight: 500 }}>Extraction complete — extracted {Object.keys(extractedData).length} parameters from <strong>{file?.name}</strong></span>
            <button className="btn btn-outline" style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }} onClick={() => { setStep(1); setExtractedData(null); setFile(null); }}>
              Upload different
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            {/* Left: Extracted data */}
            <div>
              {/* Policy params grid */}
              <h5 style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: 600 }}>Extracted Policy Parameters</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '0.875rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Spending</p>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>${extractedData.spending_commitment}B</h3>
                  </div>
                </div>
                <div className="card" style={{ padding: '0.875rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: extractedData.revenue_impact < 0 ? 'var(--red-light)' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingDown size={18} color={extractedData.revenue_impact < 0 ? 'var(--red)' : 'var(--green)'} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Revenue</p>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: extractedData.revenue_impact < 0 ? 'var(--red)' : 'var(--green)' }}>{extractedData.revenue_impact}%</h3>
                  </div>
                </div>
                <div className="card" style={{ padding: '0.875rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} color="var(--amber)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Duration</p>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{extractedData.duration_months} months</h3>
                  </div>
                </div>
                <div className="card" style={{ padding: '0.875rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Layers size={18} color="var(--purple)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.5625rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>Sectors</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.125rem' }}>
                      {(extractedData.primary_sectors || []).map((s, i) => <span key={i} className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw JSON */}
              <div className="card" style={{ padding: '0.75rem 1rem' }}>
                <h5 style={{ margin: 0, marginBottom: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileType2 size={12} /> Raw JSON
                </h5>
                <pre style={{ background: 'var(--bg-app)', padding: '0.625rem', borderRadius: '6px', fontSize: '0.625rem', overflow: 'auto', margin: 0, maxHeight: '160px', border: '1px solid var(--border-light)', color: 'var(--accent)' }}>
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Right: Assumptions + Run */}
            <div>
              <div className="card" style={{ marginBottom: '0.75rem' }}>
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.06em', margin: 0 }}>
                  <Settings2 size={14} /> Economic Assumptions
                </h5>
                <p style={{ fontSize: '0.6875rem', margin: '0.25rem 0 1rem', color: 'var(--text-tertiary)' }}>Auto-filled by AI from your document</p>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Baseline Debt</label>
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>USD Billion</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>$</span>
                    <input type="text" className="input-field" style={{ paddingLeft: '22px', paddingRight: '20px' }} value={debt} onChange={(e) => setDebt(e.target.value)} />
                    <span style={{ position: 'absolute', right: '10px', top: '9px', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>B</span>
                  </div>
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Baseline GDP</label>
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>USD Billion</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>$</span>
                    <input type="text" className="input-field" style={{ paddingLeft: '22px', paddingRight: '20px' }} value={gdp} onChange={(e) => setGdp(e.target.value)} />
                    <span style={{ position: 'absolute', right: '10px', top: '9px', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>B</span>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Current Deficit</label>
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>% of GDP</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type="text" className="input-field" style={{ paddingRight: '20px' }} value={deficit} onChange={(e) => setDeficit(e.target.value)} />
                    <span style={{ position: 'absolute', right: '10px', top: '9px', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>%</span>
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleSimulate} disabled={simLoading} style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                  {simLoading ? <><Loader size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Running...</> : <>▶ Run Stress Test <ArrowRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
