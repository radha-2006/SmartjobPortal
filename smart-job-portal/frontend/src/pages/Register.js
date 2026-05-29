import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: params.get('role') || 'jobseeker', companyName: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="card" style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Create your account</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Join thousands of professionals on Smart Job Portal</p>

          {/* Role Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--gray-100)', borderRadius: 10, padding: 4 }}>
            {['jobseeker', 'recruiter'].map(r => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  background: form.role === r ? 'white' : 'transparent',
                  color: form.role === r ? 'var(--primary)' : 'var(--gray-500)',
                  boxShadow: form.role === r ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {r === 'jobseeker' ? '👤 Job Seeker' : '🏢 Recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required placeholder="Your full name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            {form.role === 'recruiter' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" required placeholder="Your company name"
                  value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+91 XXXXXXXXXX"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required placeholder="Min 6 chars"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" required placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
