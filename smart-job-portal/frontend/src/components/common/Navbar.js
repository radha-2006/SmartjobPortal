import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Smart<span>Jobs</span></Link>

        <div className="navbar-links">
          <Link to="/jobs" className={isActive('/jobs')}>Browse Jobs</Link>
          {user && <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>}
          {user?.role === 'recruiter' && <>
            <Link to="/post-job" className={isActive('/post-job')}>Post Job</Link>
            <Link to="/my-jobs" className={isActive('/my-jobs')}>My Listings</Link>
          </>}
          {user?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        </div>

        <div className="navbar-user">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <div
                className="avatar"
                style={{ cursor: 'pointer' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {user.profilePhoto
                  ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }} onClick={() => setMenuOpen(!menuOpen)}>
                {user.name.split(' ')[0]} ▾
              </span>
              {menuOpen && (
                <div style={{ position: 'absolute', top: '110%', right: 0, background: 'white', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                  <Link to="/profile" className="nav-link" style={{ display: 'block', padding: '12px 18px', borderRadius: 0 }} onClick={() => setMenuOpen(false)}>My Profile</Link>
                  {user.role === 'jobseeker' && <Link to="/my-applications" className="nav-link" style={{ display: 'block', padding: '12px 18px', borderRadius: 0 }} onClick={() => setMenuOpen(false)}>My Applications</Link>}
                  <button onClick={handleLogout} style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: 15 }}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
