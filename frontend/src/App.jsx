import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { BarChart3, LogOut, User } from 'lucide-react';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // Hide navbar entirely on login page
  if (location.pathname === '/login') return null;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div style={{ background: 'var(--accent-gradient)', color: '#1a1a1a', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <BarChart3 size={16} />
        </div>
        Fiscal Stress Engine
      </Link>
      
      {user && (
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>Simulations</Link>
        </div>
      )}

      <div className="nav-links" style={{ gap: '0.5rem' }}>
        {user ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#1a1a1a', border: 'none', cursor: 'pointer' }}>
              {user.email.substring(0, 2).toUpperCase()}
            </button>
            
            {menuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', width: '160px', boxShadow: 'var(--shadow)', zIndex: 50 }}>
                <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <button 
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--red-light)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          location.pathname !== '/' && (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.75rem' }}>Login</Link>
          )
        )}
      </div>
    </nav>
  );
}

function App() {
  // Hackathon mock auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('app_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Protected Routes */}
        <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
