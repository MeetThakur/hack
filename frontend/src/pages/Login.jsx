import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email && password) {
        if (onLogin) onLogin({ email });
        navigate('/upload');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-header">
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Login to continue analyzing policies</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="email"
                className="input-field"
                placeholder="Email address"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', cursor: 'pointer' }}>Forgot password?</span>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '0.75rem', fontSize: '0.9375rem' }}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>

        <button type="button" className="btn btn-outline btn-full" onClick={() => { if (onLogin) onLogin({ email: 'guest@example.com' }); navigate('/upload'); }} style={{ padding: '0.625rem' }}>
          Continue as Guest
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Don't have an account? <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}
