import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const STATUSES = ['applied', 'under_review', 'shortlisted', 'interview', 'offered', 'rejected'];
const STATUS_COLORS = { applied:'badge-blue', under_review:'badge-yellow', shortlisted:'badge-green', interview:'badge-purple', offered:'badge-green', rejected:'badge-red', withdrawn:'badge-gray' };

export default function JobApplications() {
  const { jobId } = useParams();
  const [apps, setApps] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [appsRes, jobRes] = await Promise.all([
          axios.get(`/api/applications/job/${jobId}`),
          axios.get(`/api/jobs/${jobId}`),
        ]);
        setApps(appsRes.data);
        setJob(jobRes.data);
      } catch { toast.error('Failed to load applications'); }
      finally { setLoading(false); }
    };
    load();
  }, [jobId]);

  const handleStatusUpdate = async (appId) => {
    if (!newStatus) return toast.error('Select a status');
    setUpdating(appId);
    try {
      const payload = { status: newStatus, note: statusNote };
      if (newStatus === 'interview' && interviewDate) payload.interviewDate = interviewDate;
      const { data } = await axios.put(`/api/applications/${appId}/status`, payload);
      setApps(apps.map(a => a._id === appId ? { ...a, status: data.status, statusHistory: data.statusHistory } : a));
      toast.success('Status updated & candidate notified');
      setSelected(null); setNewStatus(''); setStatusNote(''); setInterviewDate('');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <Link to="/my-jobs" style={{ color: 'var(--primary)', fontSize: 14 }}>← Back to My Jobs</Link>
            <h1 className="section-title" style={{ marginTop: 8 }}>{job?.jobTitle}</h1>
            <p style={{ color: 'var(--gray-500)' }}>{apps.length} application{apps.length !== 1 ? 's' : ''} · {job?.location} · {job?.jobType}</p>
          </div>

          {/* Summary bar */}
          <div className="stats-cards" style={{ marginBottom: 20 }}>
            {STATUSES.map(s => (
              <div key={s} className="stat-card" style={{ cursor: 'pointer', border: filter === s ? '2px solid var(--primary)' : '2px solid transparent' }}
                onClick={() => setFilter(filter === s ? 'all' : s)}>
                <div className="stat-card-num" style={{ fontSize: 22 }}>{apps.filter(a => a.status === s).length}</div>
                <div className="stat-card-label" style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All ({apps.length})</button>
            {STATUSES.filter(s => apps.some(a => a.status === s)).map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
                {s.replace('_', ' ')} ({apps.filter(a => a.status === s).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: 'var(--gray-500)' }}>No applications in this category</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(app => (
                <div key={app._id} className="card">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: 'var(--primary)', flexShrink: 0 }}>
                      {app.applicant?.name?.[0] || '?'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16 }}>{app.applicant?.name}</h3>
                        <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{app.status.replace('_', ' ')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-500)' }}>
                        <span>✉️ {app.applicant?.email}</span>
                        {app.applicant?.phone && <span>📞 {app.applicant.phone}</span>}
                        {app.applicant?.location && <span>📍 {app.applicant.location}</span>}
                        <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                      {app.applicant?.skills?.length > 0 && (
                        <div className="job-skills" style={{ marginTop: 8 }}>
                          {app.applicant.skills.slice(0, 6).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {app.resumeFile && (
                        <a href={app.resumeFile} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">📄 Resume</a>
                      )}
                      <button className="btn btn-sm btn-primary" onClick={() => { setSelected(selected?._id === app._id ? null : app); setNewStatus(app.status); }}>
                        {selected?._id === app._id ? 'Close' : '⚙️ Manage'}
                      </button>
                    </div>
                  </div>

                  {selected?._id === app._id && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div>
                        <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Update Status</h4>
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                        {newStatus === 'interview' && (
                          <div className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label">Interview Date & Time</label>
                            <input className="form-input" type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
                          </div>
                        )}
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label className="form-label">Note (optional)</label>
                          <textarea className="form-input" rows={3} value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="Add a note for this status change..." />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(app._id)} disabled={updating === app._id}>
                          {updating === app._id ? 'Updating...' : '✅ Update & Notify Candidate'}
                        </button>
                      </div>

                      <div>
                        <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Timeline</h4>
                        {app.statusHistory?.map((h, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                            <div>
                              <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{h.status?.replace('_', ' ')}</span>
                              {h.note && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}> – {h.note}</span>}
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(h.changedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}

                        {app.coverLetter && (
                          <div style={{ marginTop: 16, padding: 14, background: 'var(--gray-100)', borderRadius: 8 }}>
                            <strong style={{ fontSize: 13 }}>Cover Letter:</strong>
                            <p style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 6, whiteSpace: 'pre-line' }}>{app.coverLetter}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
