import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 72, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: 8 }}>404</h1>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">🏠 Go Home</Link>
            <Link to="/jobs" className="btn btn-outline">💼 Browse Jobs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
