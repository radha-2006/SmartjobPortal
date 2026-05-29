import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '',
    location: user?.location || '', linkedIn: user?.linkedIn || '',
    portfolio: user?.portfolio || '', skills: user?.skills?.join(', ') || '',
    companyName: user?.companyName || '', companyWebsite: user?.companyWebsite || '',
    companyDescription: user?.companyDescription || '',
  });
  const resumeRef = useRef();
  const photoRef = useRef();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await axios.put('/api/users/profile', payload);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await axios.post('/api/users/upload-resume', fd);
      updateUser({ resumeFile: data.resumeFile });
      toast.success('Resume uploaded!');
    } catch { toast.error('Upload failed'); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await axios.post('/api/users/upload-photo', fd);
      updateUser({ profilePhoto: data.profilePhoto });
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const tabs = ['basic', 'resume', ...(user?.role === 'jobseeker' ? ['experience', 'education'] : ['company']), 'security'];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 className="section-title">My Profile</h1>

          {/* Profile Header Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>
                {user?.profilePhoto
                  ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : user?.name?.[0]?.toUpperCase()
                }
              </div>
              <button onClick={() => photoRef.current.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}>✎</button>
              <input ref={photoRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{user?.name}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{user?.email} · <span className="badge badge-blue" style={{ fontSize: 12 }}>{user?.role}</span></div>
              {user?.resumeFile && <div style={{ fontSize: 13, color: 'var(--success)', marginTop: 4 }}>✅ Resume uploaded</div>}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--gray-100)', paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: tab === t ? 'var(--primary)' : 'var(--gray-500)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2, textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          <div className="card">
            <form onSubmit={save}>
              {tab === 'basic' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, State" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio / Summary</label>
                    <textarea className="form-input" rows={4} placeholder="Write a brief professional summary..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                  </div>
                  {user?.role === 'jobseeker' && <>
                    <div className="form-group">
                      <label className="form-label">Skills <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>(comma separated)</span></label>
                      <input className="form-input" placeholder="React, Node.js, MongoDB, Python..." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">LinkedIn URL</label>
                        <input className="form-input" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Portfolio URL</label>
                        <input className="form-input" placeholder="https://yourportfolio.com" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} />
                      </div>
                    </div>
                  </>}
                </>
              )}

              {tab === 'resume' && (
                <div>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Resume</h3>
                  {user?.resumeFile ? (
                    <div className="alert alert-success" style={{ marginBottom: 16 }}>
                      ✅ Resume uploaded. <a href={user.resumeFile} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>View Resume</a>
                    </div>
                  ) : (
                    <div className="alert alert-info" style={{ marginBottom: 16 }}>📎 No resume uploaded yet.</div>
                  )}
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} style={{ display: 'none' }} />
                  <button type="button" className="btn btn-primary" onClick={() => resumeRef.current.click()}>
                    {user?.resumeFile ? 'Replace Resume' : 'Upload Resume'} (PDF/DOC)
                  </button>
                </div>
              )}

              {tab === 'company' && user?.role === 'recruiter' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Website</label>
                    <input className="form-input" placeholder="https://company.com" value={form.companyWebsite} onChange={e => setForm({ ...form, companyWebsite: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Description</label>
                    <textarea className="form-input" rows={4} value={form.companyDescription} onChange={e => setForm({ ...form, companyDescription: e.target.value })} />
                  </div>
                </>
              )}

              {tab === 'security' && (
                <ChangePasswordForm />
              )}

              {tab !== 'resume' && tab !== 'security' && (
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await axios.put('/api/users/change-password', form);
      toast.success('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Change Password</h3>
      {['currentPassword', 'newPassword', 'confirm'].map(field => (
        <div key={field} className="form-group">
          <label className="form-label">{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
          <input className="form-input" type="password" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
        </div>
      ))}
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
    </form>
  );
}
