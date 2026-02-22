import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart, Settings, Bell, HelpCircle } from 'lucide-react';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';

function Navbar() {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/login') return null;

  return (
    <nav className="navbar">
      <Link to="/upload" className="nav-brand">
        <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '4px', borderRadius: '4px' }}>
          <BarChart size={20} />
        </div>
        Fiscal Stress Engine
      </Link>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>Simulations</Link>
        <Link to="#" className="nav-link" onClick={(e) => { e.preventDefault(); alert("Reports section coming soon!"); }}>Reports</Link>
      </div>
      <div className="nav-links">
        <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none' }} onClick={() => alert("Settings functionality coming soon!")}><Settings size={20} className="text-secondary" /></button>
        <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none' }} onClick={() => alert("Help Center functionality coming soon!")}><HelpCircle size={20} className="text-secondary" /></button>
        <button className="btn btn-outline" style={{ padding: '0.3rem', border: 'none' }} onClick={() => alert("No new notifications")}><Bell size={20} className="text-secondary" /></button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User Avatar" />
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
