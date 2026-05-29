import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/jobs/myjobs');
      setJobs(data);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/jobs/${id}`);
      setJobs(jobs.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete job'); }
    finally { setDeleting(null); }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await axios.put(`/api/jobs/${job._id}`, { status: newStatus });
      setJobs(jobs.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'}`);
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: 4 }}>My Job Postings</h1>
              <p style={{ color: 'var(--gray-500)' }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
            </div>
            <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 52, marginBottom: 12 }}>📢</div>
              <h3>No Jobs Posted Yet</h3>
              <p>Create your first job posting to start receiving applications</p>
              <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>Post a Job</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {jobs.map(job => (
                <div key={job._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16 }}>{job.jobTitle}</h3>
                      <span className={`badge ${job.status === 'active' ? 'badge-green' : job.status === 'draft' ? 'badge-yellow' : 'badge-gray'}`}>{job.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-500)' }}>
                      <span>📍 {job.location}</span>
                      <span>🧰 {job.jobType}</span>
                      <span>👥 {job.applicationCount} applications</span>
                      <span>👁 {job.views} views</span>
                      <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    {job.deadline && (
                      <div style={{ fontSize: 12, color: new Date(job.deadline) < new Date() ? 'var(--danger)' : 'var(--warning)', marginTop: 4 }}>
                        {new Date(job.deadline) < new Date() ? '⚠️ Deadline passed' : `⏰ Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/job-applications/${job._id}`} className="btn btn-sm btn-outline">
                      📋 Applications ({job.applicationCount})
                    </Link>
                    <Link to={`/edit-job/${job._id}`} className="btn btn-sm btn-outline">✏️ Edit</Link>
                    <button className="btn btn-sm btn-outline" onClick={() => toggleStatus(job)}>
                      {job.status === 'active' ? '⏸ Close' : '▶ Activate'}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--danger)', color: 'white' }}
                      onClick={() => handleDelete(job._id)}
                      disabled={deleting === job._id}
                    >
                      {deleting === job._id ? '...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        .empty-state { text-align: center; padding: 60px 24px; background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
        .empty-state h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .empty-state p { color: var(--gray-500); }
      `}</style>
    </div>
  );
}
