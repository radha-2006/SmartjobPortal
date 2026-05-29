import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            {sent ? (
              <>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📧</div>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Check Your Email</h2>
                <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>We've sent a password reset link to <strong>{email}</strong></p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Back to Login</Link>
              </>
            ) : (
              <>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Forgot Password?</h2>
                <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Enter your email and we'll send you a reset link</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <input className="form-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
                <p style={{ marginTop: 20, fontSize: 14, color: 'var(--gray-500)' }}>
                  Remembered it? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
