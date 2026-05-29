import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const CATEGORIES = ['Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'HR', 'Operations', 'Healthcare'];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    category: searchParams.get('category') || '',
    experience: '',
    page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await axios.get('/api/jobs', { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch { setJobs([]); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const statusColor = (status) => status === 'active' ? 'badge-green' : 'badge-gray';

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          {/* Search bar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input className="form-input" style={{ flex: 2, minWidth: 200 }} placeholder="Job title, skill, company..."
                value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} />
              <input className="form-input" style={{ flex: 1, minWidth: 160 }} placeholder="Location..."
                value={filters.location} onChange={e => updateFilter('location', e.target.value)} />
              <button className="btn btn-primary" onClick={fetchJobs}>Search</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Filters */}
            <div className="filters-panel">
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>Filters</div>
              <div className="filter-section">
                <div className="filter-title">Job Type</div>
                {JOB_TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="jobType" value={t} checked={filters.jobType === t}
                      onChange={() => updateFilter('jobType', filters.jobType === t ? '' : t)} />
                    {t}
                  </label>
                ))}
              </div>
              <div className="filter-section">
                <div className="filter-title">Category</div>
                <select className="form-input form-select" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-section">
                <div className="filter-title">Experience</div>
                <select className="form-input form-select" value={filters.experience} onChange={e => updateFilter('experience', e.target.value)}>
                  <option value="">Any Experience</option>
                  <option>0-1 years</option>
                  <option>1-3 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </div>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setFilters({ keyword: '', location: '', jobType: '', category: '', experience: '', page: 1 })}>
                Clear Filters
              </button>
            </div>

            {/* Job listings */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{total} jobs found</p>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : jobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3>No jobs found</h3>
                  <p style={{ color: 'var(--gray-500)' }}>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {jobs.map(job => (
                    <Link to={`/jobs/${job._id}`} key={job._id}>
                      <div className="job-card">
                        <div className="job-card-header">
                          <div className="company-logo">{job.companyName?.[0] || 'C'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div className="job-title">{job.jobTitle}</div>
                                <div className="company-name">{job.companyName}</div>
                              </div>
                              <span className={`badge ${statusColor(job.status)}`}>{job.jobType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="job-meta">
                          <span className="job-meta-item">📍 {job.location}</span>
                          <span className="job-meta-item">💼 {job.experienceRequired}</span>
                          {job.salaryRange?.max > 0 && <span className="job-meta-item">💰 ₹{job.salaryRange.min}–{job.salaryRange.max}K/mo</span>}
                          <span className="job-meta-item">👁 {job.views} views</span>
                          <span className="job-meta-item">📝 {job.applicationCount} applied</span>
                        </div>
                        <div className="job-skills">
                          {job.requiredSkills?.slice(0, 5).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                          {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, page: p }))}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
