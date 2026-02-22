import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, FileType2, Settings2, Info } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [debt, setDebt] = useState('24,500');
  const [gdp, setGdp] = useState('18,200');
  const [deficit, setDeficit] = useState('5.4');

  const handleUpload = () => {
    setLoading(true);
    // Simulate API call and analysis processing
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          <span>Home</span> &gt; <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Policy Stress Testing</span>
        </div>
        <h1>Upload Policy Document</h1>
        <p style={{ maxWidth: '600px', fontSize: '1.125rem' }}>
          Input your policy document to begin the fiscal simulation. Supported formats include PDF, CSV, and JSON data structures.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        {/* Main Upload Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '0.5rem' }}>
            <div className="upload-zone" onClick={handleUpload}>
              <div className="upload-icon-wrapper">
                <UploadCloud size={24} />
              </div>
              <h3 style={{ margin: 0 }}>Drag and drop your policy file here</h3>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Max file size 50MB</p>
              
              <div style={{ display: 'flex', alignItems: 'center', width: '200px', margin: '1rem 0', gap: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>
              
              <button className="btn btn-outline" style={{ background: 'white' }} onClick={(e) => { e.stopPropagation(); alert("File browser would open here"); }}>
                <Folder size={16} /> Browse files
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FileType2 size={16} color="var(--text-tertiary)" /> Recent Uploads
            </h4>
            
            <div className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-red-light)', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   PDF
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.875rem' }}>Fiscal_Policy_2023_v2.pdf</h5>
                  <p style={{ margin: 0, fontSize: '0.75rem' }}>Uploaded 2 hours ago • 2.4 MB</p>
                </div>
              </div>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
            </div>

            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#dcfce7', color: '#16a34a', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   CSV
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.875rem' }}>Raw_Data_Q3_Export.csv</h5>
                  <p style={{ margin: 0, fontSize: '0.75rem' }}>Uploaded yesterday • 8.1 MB</p>
                </div>
              </div>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
            </div>
          </div>
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

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Projected Fiscal Gap</span>
               <span style={{ fontWeight: 600 }}>--</span>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleUpload} style={{ padding: '0.75rem', fontSize: '1rem' }}>
              {loading ? 'Processing...' : '▶ Run Stress Test'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>This simulation may take up to 2 minutes.</p>
          </div>

          <div className="card" style={{ background: 'var(--accent-blue-light)', border: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
             <Info size={20} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
             <div>
               <h5 style={{ margin: 0, color: 'var(--text-primary)' }}>Need Help?</h5>
               <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '0.25rem' }}>Refer to the <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }} onClick={() => alert("Opening Policy Guide Docs...")}>Policy Guide</span> for detailed instructions on preparing your JSON/CSV files for upload.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
