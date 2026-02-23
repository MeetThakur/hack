import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEMO_EMAIL = 'demo@fiscalengine.com';
const DEMO_PASSWORD = 'Demo@1234';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const signInWith = async (e, em, pw) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: em, password: pw });
      if (authError) throw authError;
      if (onLogin) onLogin(data.user);
      navigate('/upload');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) { setError('Enter your email and password to sign up.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (data.user && !data.session) {
        setError('Check your inbox to confirm your email before logging in.');
      } else if (data.user) {
        if (onLogin) onLogin(data.user);
        navigate('/upload');
      }
    } catch (err) {
      setError(err.message || 'Sign up failed.');
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

        <form onSubmit={(e) => signInWith(e, email, password)}>
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

          {error && (
            <div style={{ padding: '0.625rem 0.75rem', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '0.75rem', fontSize: '0.9375rem', marginBottom: '0.5rem' }}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>

        <button type="button" className="btn btn-outline btn-full" onClick={handleSignUp} disabled={loading} style={{ padding: '0.625rem' }}>
          Sign Up
        </button>

        <button type="button" className="btn btn-secondary btn-full" onClick={(e) => signInWith(e, DEMO_EMAIL, DEMO_PASSWORD)} disabled={loading} style={{ padding: '0.625rem', marginTop: '0.75rem', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
          {loading ? 'Logging in as Demo...' : 'Demo Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}



