import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: 'badge-blue' },
  under_review: { label: 'Under Review', color: 'badge-yellow' },
  shortlisted: { label: 'Shortlisted', color: 'badge-green' },
  interview: { label: 'Interview', color: 'badge-purple' },
  offered: { label: 'Offered 🎉', color: 'badge-green' },
  rejected: { label: 'Rejected', color: 'badge-red' },
  withdrawn: { label: 'Withdrawn', color: 'badge-gray' },
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/api/applications/my')
      .then(({ data }) => setApps(data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await axios.put(`/api/applications/${id}/withdraw`);
      setApps(apps.map(a => a._id === id ? { ...a, status: 'withdrawn' } : a));
      toast.success('Application withdrawn');
      setSelected(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot withdraw'); }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1 className="section-title">My Applications</h1>
          <p className="section-sub">{apps.length} application{apps.length !== 1 ? 's' : ''} submitted</p>

          {/* Stats */}
          <div className="stats-cards" style={{ marginBottom: 24 }}>
            {['applied', 'under_review', 'shortlisted', 'interview', 'offered', 'rejected'].map(s => (
              <div key={s} className="stat-card" style={{ cursor: 'pointer', border: filter === s ? '2px solid var(--primary)' : '2px solid transparent' }} onClick={() => setFilter(filter === s ? 'all' : s)}>
                <div className="stat-card-num">{apps.filter(a => a.status === s).length}</div>
                <div className="stat-card-label">{STATUS_CONFIG[s]?.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All ({apps.length})</button>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              apps.filter(a => a.status === key).length > 0 &&
              <button key={key} className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(key)}>
                {label} ({apps.filter(a => a.status === key).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: 'var(--gray-500)' }}>No applications found</p>
              <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Jobs</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(app => (
                <div key={app._id} className="card app-card" onClick={() => setSelected(selected?._id === app._id ? null : app)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div className="company-logo">{app.job?.companyName?.[0] || '?'}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{app.job?.jobTitle || 'Job Deleted'}</div>
                        <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{app.job?.companyName} · {app.job?.location}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Applied {new Date(app.appliedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span className={`badge ${STATUS_CONFIG[app.status]?.color || 'badge-gray'}`}>{STATUS_CONFIG[app.status]?.label}</span>
                      {app.job?._id && <Link to={`/jobs/${app.job._id}`} className="btn btn-sm btn-outline" onClick={e => e.stopPropagation()}>View Job</Link>}
                      {!['offered', 'rejected', 'withdrawn'].includes(app.status) && (
                        <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }}
                          onClick={e => { e.stopPropagation(); withdraw(app._id); }}>Withdraw</button>
                      )}
                    </div>
                  </div>

                  {selected?._id === app._id && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
                      <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Application Timeline</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {app.statusHistory?.map((h, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                            <div>
                              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{h.status?.replace('_', ' ')}</span>
                              {h.note && <span style={{ color: 'var(--gray-500)', fontSize: 13 }}> – {h.note}</span>}
                              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(h.changedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {app.interviewDate && (
                        <div style={{ marginTop: 16, padding: 16, background: '#ede9fe', borderRadius: 8 }}>
                          <strong>🗓 Interview Scheduled:</strong> {new Date(app.interviewDate).toLocaleString()}
                          {app.interviewLocation && <div style={{ marginTop: 4 }}>📍 {app.interviewLocation}</div>}
                        </div>
                      )}
                      {app.coverLetter && (
                        <div style={{ marginTop: 16 }}>
                          <strong style={{ fontSize: 14 }}>Cover Letter:</strong>
                          <p style={{ color: 'var(--gray-700)', fontSize: 14, marginTop: 6, whiteSpace: 'pre-line' }}>{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style>{`
        .app-card { cursor: pointer; transition: border-color 0.2s; border: 2px solid transparent; }
        .app-card:hover { border-color: var(--primary-light); }
      `}</style>
    </div>
  );
}
