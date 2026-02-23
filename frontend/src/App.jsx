import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';

function Navbar() {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/login') return null;

  return (
    <nav className="navbar">
      <Link to="/upload" className="nav-brand">
        <div style={{ background: 'var(--accent)', color: 'white', padding: '5px', borderRadius: '6px', display: 'flex' }}>
          <BarChart3 size={16} />
        </div>
        Fiscal Stress Engine
      </Link>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>Simulations</Link>
      </div>
      <div className="nav-links" style={{ gap: '0.125rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-subtle)', overflow: 'hidden' }}>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="avatar" style={{ width: '100%' }} />
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
