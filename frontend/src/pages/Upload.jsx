import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, FileType2, Settings2, Info, CheckCircle, Loader, ArrowRight, DollarSign, TrendingDown, Clock, Layers } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = upload, 2 = review extracted data
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [policyId, setPolicyId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [debt, setDebt] = useState('24,500');
  const [gdp, setGdp] = useState('18,200');
  const [deficit, setDeficit] = useState('5.4');

  // Step 1: Upload file and extract data via AI
  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a policy document to upload first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://127.0.0.1:8000/analyze-policy', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Analysis failed. Is the backend running?");

      const data = await res.json();
      console.log('=== AI Extracted Data ===', data);
      setPolicyId(data.policy_id);
      setExtractedData(data.extracted_data);
      setStep(2);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Run simulation with extracted data + user config
  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: policyId,
          baseline_debt: parseFloat(debt.replace(/,/g, '')),
          baseline_gdp: parseFloat(gdp.replace(/,/g, '')),
          current_deficit: parseFloat(deficit.replace(/,/g, ''))
        })
      });

      if (!res.ok) throw new Error("Simulation failed.");
      const simData = await res.json();
      console.log('=== Simulation Results ===', simData);
      navigate(`/dashboard?policy_id=${policyId}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          <span>Home</span> &gt; <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Policy Stress Testing</span>
        </div>
        <h1>{step === 1 ? 'Upload Policy Document' : 'Review Extracted Data'}</h1>
        <p style={{ maxWidth: '600px', fontSize: '1.125rem' }}>
          {step === 1
            ? 'Input your policy document to begin the fiscal simulation. Supported formats include PDF, CSV, and JSON data structures.'
            : 'Our AI has analyzed your document and extracted the following fiscal parameters. Review the data below, then run the stress test.'}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--accent-blue)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700
          }}>{step > 1 ? <CheckCircle size={16} /> : '1'}</div>
          <span style={{ fontWeight: step === 1 ? 600 : 400, color: step === 1 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: '0.875rem' }}>Upload & Parse</span>
        </div>
        <div style={{ width: '60px', height: '2px', background: step >= 2 ? 'var(--accent-blue)' : 'var(--border-color)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step >= 2 ? 'var(--accent-blue)' : 'var(--border-color)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700
          }}>2</div>
          <span style={{ fontWeight: step === 2 ? 600 : 400, color: step === 2 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: '0.875rem' }}>Review & Simulate</span>
        </div>
      </div>

      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
          {/* Upload Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '0.5rem' }}>
              <div className="upload-zone" style={{ position: 'relative', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".pdf,.csv,.json,.txt"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div className="upload-icon-wrapper">
                  <UploadCloud size={24} />
                </div>
                <h3 style={{ margin: 0 }}>Drag and drop your policy file here</h3>

                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-app)', borderRadius: '4px', marginTop: '1rem', border: '1px solid var(--border-color)', fontSize: '0.875rem', color: file ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
                  {file ? `✓ ${file.name}` : 'No file selected. Please select a PDF or CSV.'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', width: '200px', margin: '1rem 0', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <button className="btn btn-outline" style={{ background: 'white' }}>
                  <Folder size={16} /> Browse files
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleAnalyze} disabled={loading || !file} style={{ padding: '0.75rem', fontSize: '1rem' }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with AI...</> : '🔍 Upload & Analyze Document'}
            </button>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <Settings2 size={16} /> CONFIGURATION
              </h5>
              <h3 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Economic Assumptions</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>Set the baseline parameters for the stress test scenario.</p>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Baseline Debt</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>USD Billion</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }}>$</span>
                  <input type="text" className="input-field" style={{ paddingLeft: '24px', paddingRight: '24px' }} value={debt} onChange={(e) => setDebt(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>B</span>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Baseline GDP</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>USD Billion</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }}>$</span>
                  <input type="text" className="input-field" style={{ paddingLeft: '24px', paddingRight: '24px' }} value={gdp} onChange={(e) => setGdp(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>B</span>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Current Deficit</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>% of GDP</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="input-field" style={{ paddingRight: '24px' }} value={deficit} onChange={(e) => setDeficit(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>%</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--accent-blue-light)', border: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <Info size={20} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
               <div>
                 <h5 style={{ margin: 0, color: 'var(--text-primary)' }}>How it works</h5>
                 <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>Upload your policy document → Our AI extracts key fiscal variables → Review the data → Run deterministic stress simulations.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && extractedData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
          {/* Extracted Data Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Success banner */}
            <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <CheckCircle size={20} color="#16a34a" />
              <div>
                <h5 style={{ margin: 0, color: '#15803d' }}>Document Analyzed Successfully</h5>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534', marginTop: '0.25rem' }}>AI extracted {Object.keys(extractedData).length} fiscal parameters from <strong>{file?.name}</strong></p>
              </div>
            </div>

            {/* Extracted metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={24} color="var(--accent-blue)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Spending Commitment</p>
                  <h3 style={{ margin: 0, marginTop: '0.25rem' }}>${extractedData.spending_commitment}B</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>per annum</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: extractedData.revenue_impact < 0 ? 'var(--accent-red-light)' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={24} color={extractedData.revenue_impact < 0 ? 'var(--accent-red)' : '#16a34a'} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Revenue Impact</p>
                  <h3 style={{ margin: 0, marginTop: '0.25rem', color: extractedData.revenue_impact < 0 ? 'var(--accent-red)' : '#16a34a' }}>{extractedData.revenue_impact}%</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>tax base change</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-yellow-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} color="var(--warning-yellow)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Policy Duration</p>
                  <h3 style={{ margin: 0, marginTop: '0.25rem' }}>{extractedData.duration_months} months</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(extractedData.duration_months / 12).toFixed(1)} years</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={24} color="#7c3aed" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Primary Sectors</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                    {(extractedData.primary_sectors || []).map((s, i) => (
                      <span key={i} className="badge badge-gray">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw JSON preview */}
            <div className="card">
              <h5 style={{ margin: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <FileType2 size={16} /> Raw Extracted JSON
              </h5>
              <pre style={{
                background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px',
                fontSize: '0.8rem', overflow: 'auto', margin: 0, maxHeight: '200px',
                border: '1px solid var(--border-color)'
              }}>
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Sidebar: Config + Run */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <Settings2 size={16} /> SIMULATION CONFIG
              </h5>
              <h3 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Economic Assumptions</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>Adjust baseline parameters before running the stress test.</p>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Baseline Debt</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>USD Billion</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }}>$</span>
                  <input type="text" className="input-field" style={{ paddingLeft: '24px', paddingRight: '24px' }} value={debt} onChange={(e) => setDebt(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>B</span>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Baseline GDP</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>USD Billion</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }}>$</span>
                  <input type="text" className="input-field" style={{ paddingLeft: '24px', paddingRight: '24px' }} value={gdp} onChange={(e) => setGdp(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>B</span>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Current Deficit</label>
                  <span className="input-label-secondary" style={{color: 'var(--text-tertiary)'}}>% of GDP</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="input-field" style={{ paddingRight: '24px' }} value={deficit} onChange={(e) => setDeficit(e.target.value)} />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-tertiary)' }}>%</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AI-Extracted Spending</span>
                 <span style={{ fontWeight: 600 }}>${extractedData.spending_commitment}B</span>
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSimulate} disabled={simLoading} style={{ padding: '0.75rem', fontSize: '1rem' }}>
                {simLoading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running Simulation...</> : <>▶ Run Stress Test <ArrowRight size={16} /></>}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>This simulation may take up to 2 minutes.</p>
            </div>

            <button className="btn btn-outline btn-full" onClick={() => { setStep(1); setExtractedData(null); setFile(null); }}>
              ← Upload Different Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
