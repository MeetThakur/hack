import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>


          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Predict fiscal strain <br />
            <span style={{ color: 'var(--accent)' }}>before policies launch.</span>
          </h1>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Upload raw policy documents. Our System instantly extracts economic parameters, simulates 5-year debt-to-GDP trajectories, and identifies early warning signals.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ fontSize: '1rem', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Get Started <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '4rem 2rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <BarChart3 size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Deterministic Simulation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Project exact budget deficits, reserve depletion years, and dynamic debt-to-GDP ratios over a 5-year horizon based on your parameters.
            </p>
          </div>

          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={24} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Interactive What-Ifs</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Adjust spending commitments and revenue impacts in real-time. Instantly see how minor tweaks affect your overall fiscal strain score.
            </p>
          </div>

          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Shield size={24} color="var(--red)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Risk Assessment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Automatically detect liquidity crunches and runaway spending with built-in early warning signals and categorizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
