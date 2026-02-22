import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mock logic for demo simplicity allowing any credentials to pass if Supabase isn't real
      if (email && password) {
        navigate('/upload');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access fiscal risk simulations and policy analysis tools.</p>
        </div>

        <div className="toggle-group">
          <div className="toggle-btn active">Sign In</div>
          <div className="toggle-btn">Create Account</div>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@institution.org"
                style={{ paddingLeft: '32px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div>
              <label className="input-label">Password</label>
              <span className="input-label-secondary">Forgot password?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter your password"
                style={{ paddingLeft: '32px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="divider">OR CONTINUE WITH</div>

        <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('/upload')}>
          Demo Login
        </button>
      </div>
    </div>
  );
}
