import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const STATUS_COLORS = { applied:'badge-blue', under_review:'badge-yellow', shortlisted:'badge-green', interview:'badge-purple', offered:'badge-green', rejected:'badge-red', withdrawn:'badge-gray' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ applications: [], jobs: [], recentJobs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'jobseeker') {
          const [apps, jobs] = await Promise.all([
            axios.get('/api/applications/my'),
            axios.get('/api/jobs?limit=4'),
          ]);
          setData({ applications: apps.data, recentJobs: jobs.data.jobs });
        } else if (user.role === 'recruiter') {
          const jobs = await axios.get('/api/jobs/myjobs');
          setData({ jobs: jobs.data });
        }
      } catch {} finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
            {user?.role === 'jobseeker' ? 'Track your applications and discover new opportunities' : 'Manage your job postings and review candidates'}
          </p>

          {/* Job Seeker Dashboard */}
          {user?.role === 'jobseeker' && (
            <>
              <div className="stats-cards">
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--primary)' }}>{data.applications.length}</div><div className="stat-card-label">Total Applications</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--warning)' }}>{data.applications.filter(a => a.status === 'under_review').length}</div><div className="stat-card-label">Under Review</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--success)' }}>{data.applications.filter(a => a.status === 'shortlisted').length}</div><div className="stat-card-label">Shortlisted</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: '#8b5cf6' }}>{data.applications.filter(a => a.status === 'interview').length}</div><div className="stat-card-label">Interviews</div></div>
              </div>

              {!user?.resumeFile && (
                <div className="alert alert-info" style={{ marginBottom: 20 }}>
                  📎 <strong>Complete your profile!</strong> Upload your resume to start applying for jobs. <Link to="/profile" style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload Now →</Link>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 18 }}>Recent Applications</h2>
                    <Link to="/my-applications" style={{ fontSize: 13, color: 'var(--primary)' }}>View all →</Link>
                  </div>
                  {data.applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                      <p>No applications yet</p>
                      <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Browse Jobs</Link>
                    </div>
                  ) : data.applications.slice(0, 5).map(app => (
                    <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{app.job?.jobTitle}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{app.job?.companyName} · {new Date(app.appliedDate).toLocaleDateString()}</div>
                      </div>
                      <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`}>{app.status?.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 18 }}>Recommended Jobs</h2>
                    <Link to="/jobs" style={{ fontSize: 13, color: 'var(--primary)' }}>View all →</Link>
                  </div>
                  {data.recentJobs?.map(job => (
                    <Link to={`/jobs/${job._id}`} key={job._id}>
                      <div style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{job.jobTitle}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{job.companyName} · {job.location}</div>
                        <div className="job-skills" style={{ marginTop: 6 }}>
                          {job.requiredSkills?.slice(0, 3).map(s => <span key={s} className="skill-tag" style={{ fontSize: 11 }}>{s}</span>)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recruiter Dashboard */}
          {user?.role === 'recruiter' && (
            <>
              <div className="stats-cards">
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--primary)' }}>{data.jobs.length}</div><div className="stat-card-label">Total Postings</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--success)' }}>{data.jobs.filter(j => j.status === 'active').length}</div><div className="stat-card-label">Active Jobs</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: 'var(--warning)' }}>{data.jobs.reduce((s, j) => s + j.applicationCount, 0)}</div><div className="stat-card-label">Total Applications</div></div>
                <div className="stat-card"><div className="stat-card-num" style={{ color: '#8b5cf6' }}>{data.jobs.reduce((s, j) => s + j.views, 0)}</div><div className="stat-card-label">Total Views</div></div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 18 }}>Your Job Postings</h2>
                  <Link to="/post-job" className="btn btn-primary btn-sm">+ Post New Job</Link>
                </div>
                {data.jobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
                    <p>No jobs posted yet</p>
                    <Link to="/post-job" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Post Your First Job</Link>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Job Title</th><th>Status</th><th>Applications</th><th>Views</th><th>Posted</th><th>Actions</th></tr></thead>
                      <tbody>
                        {data.jobs.map(job => (
                          <tr key={job._id}>
                            <td><div style={{ fontWeight: 600 }}>{job.jobTitle}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{job.location} · {job.jobType}</div></td>
                            <td><span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span></td>
                            <td><strong>{job.applicationCount}</strong></td>
                            <td>{job.views}</td>
                            <td style={{ fontSize: 13 }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <Link to={`/job-applications/${job._id}`} className="btn btn-sm btn-outline">View Apps</Link>
                                <Link to={`/edit-job/${job._id}`} className="btn btn-sm btn-outline">Edit</Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
