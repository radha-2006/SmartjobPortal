import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    axios.get(`/api/jobs/${id}`).then(r => setJob(r.data)).catch(() => navigate('/jobs')).finally(() => setLoading(false));
    if (user?.role === 'jobseeker') {
      axios.get('/api/applications/my').then(r => {
        setApplied(r.data.some(a => a.job?._id === id));
      }).catch(() => {});
    }
  }, [id, user, navigate]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    if (!user.resumeFile) return toast.error('Please upload your resume in your profile first');
    setApplying(true);
    try {
      await axios.post('/api/applications', { jobId: id, coverLetter });
      toast.success('Application submitted!');
      setApplied(true);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job) return null;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            {/* Main */}
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="job-card-header" style={{ marginBottom: 20 }}>
                  <div className="company-logo" style={{ width: 64, height: 64, fontSize: 24 }}>{job.companyName?.[0] || 'C'}</div>
                  <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{job.jobTitle}</h1>
                    <div style={{ color: 'var(--gray-500)', fontSize: 16 }}>{job.companyName}</div>
                  </div>
                </div>
                <div className="job-meta" style={{ marginBottom: 16 }}>
                  <span className="job-meta-item">📍 {job.location}</span>
                  <span className="job-meta-item">💼 {job.jobType}</span>
                  <span className="job-meta-item">🎯 {job.experienceRequired}</span>
                  {job.salaryRange?.max > 0 && <span className="job-meta-item">💰 ₹{job.salaryRange.min}–{job.salaryRange.max}K/mo</span>}
                  <span className="job-meta-item">🏢 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                </div>
                <div className="job-skills">
                  {job.requiredSkills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Job Description</h2>
                <div style={{ lineHeight: 1.8, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{job.jobDescription}</div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 88 }}>
              <div className="card" style={{ marginBottom: 16 }}>
                {user?.role === 'jobseeker' ? (
                  applied ? (
                    <div>
                      <div className="alert alert-success" style={{ textAlign: 'center' }}>✅ Application Submitted</div>
                      <Link to="/my-applications" className="btn btn-outline" style={{ width: '100%' }}>Track Application</Link>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setShowModal(true)}>
                      Apply Now
                    </button>
                  )
                ) : !user ? (
                  <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Login to Apply</Link>
                ) : null}

                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>📅 Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                  {job.deadline && <div>⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}</div>}
                  <div>👁 {job.views} views</div>
                  <div>📝 {job.applicationCount} applications</div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>About the Company</h3>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{job.companyName}</div>
                {job.recruiter?.companyWebsite && <a href={job.recruiter.companyWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 14 }}>Visit Website →</a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Apply for {job.jobTitle}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="alert alert-info">📎 Your uploaded resume will be submitted automatically</div>
            <div className="form-group">
              <label className="form-label">Cover Letter (Optional)</label>
              <textarea className="form-input" rows={5} placeholder="Why are you a great fit for this role?"
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
