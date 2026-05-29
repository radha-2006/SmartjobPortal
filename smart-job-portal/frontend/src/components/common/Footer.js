import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">SmartJobs</div>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7 }}>Connecting talent with opportunities across India and beyond.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>For Job Seekers</div>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/register">Create Profile</Link></li>
              <li><Link to="/my-applications">Track Applications</Link></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>For Recruiters</div>
            <ul className="footer-links">
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/my-jobs">Manage Listings</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Company</div>
            <ul className="footer-links">
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Contact</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} Smart Job Portal. All rights reserved.</div>
      </div>
    </footer>
  );
}
