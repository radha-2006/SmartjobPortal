import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CATEGORIES = ['Technology', 'Finance', 'Marketing', 'Design', 'Sales', 'HR', 'Operations', 'Healthcare'];

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0, placed: 0 });

  useEffect(() => {
    axios.get('/api/jobs?limit=6').then(r => setRecentJobs(r.data.jobs || []));
    axios.get('/api/jobs').then(r => setStats({ jobs: r.data.total || 0, companies: 150, placed: 2400 }));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${keyword}&location=${location}`);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <h1>Find Your Dream<br />Career Today</h1>
        <p>Discover thousands of job opportunities from top companies. Your next opportunity is just a search away.</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Job title, skill, or keyword..." />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or location..." />
          <button type="submit">Search Jobs</button>
        </form>
        <div style={{ marginTop: 20, fontSize: 14, opacity: 0.8 }}>
          Popular: <Link to="/jobs?keyword=React" style={{ color: 'white', textDecoration: 'underline', margin: '0 8px' }}>React</Link>
          <Link to="/jobs?keyword=Python" style={{ color: 'white', textDecoration: 'underline', margin: '0 8px' }}>Python</Link>
          <Link to="/jobs?keyword=Node.js" style={{ color: 'white', textDecoration: 'underline', margin: '0 8px' }}>Node.js</Link>
          <Link to="/jobs?keyword=Design" style={{ color: 'white', textDecoration: 'underline', margin: '0 8px' }}>UI/UX Design</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stats-grid">
          <div><div className="stat-num">{stats.jobs}+</div><div className="stat-label">Active Jobs</div></div>
          <div><div className="stat-num">{stats.companies}+</div><div className="stat-label">Companies</div></div>
          <div><div className="stat-num">{stats.placed}+</div><div className="stat-label">Candidates Placed</div></div>
          <div><div className="stat-num">50+</div><div className="stat-label">Job Categories</div></div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 24px', background: '#f8fafc' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Browse by Category</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Find jobs across top industries</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/jobs?category=${cat}`}
                style={{ background: 'white', borderRadius: 12, padding: '20px 16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.2s', display: 'block', fontWeight: 600 }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={e => e.currentTarget.style.transform = ''}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {{'Technology':'💻','Finance':'💰','Marketing':'📈','Design':'🎨','Sales':'🤝','HR':'👥','Operations':'⚙️','Healthcare':'🏥'}[cat]}
                </div>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <section style={{ padding: '60px 24px' }}>
          <div className="container">
            <h2 className="section-title">Latest Opportunities</h2>
            <p className="section-sub">Freshly posted jobs from top companies</p>
            <div className="jobs-grid">
              {recentJobs.map(job => (
                <Link to={`/jobs/${job._id}`} key={job._id}>
                  <div className="job-card card-hover">
                    <div className="job-card-header">
                      <div className="company-logo">{job.companyName?.[0] || 'C'}</div>
                      <div>
                        <div className="job-title">{job.jobTitle}</div>
                        <div className="company-name">{job.companyName}</div>
                      </div>
                    </div>
                    <div className="job-meta">
                      <span className="job-meta-item">📍 {job.location}</span>
                      <span className="job-meta-item">💼 {job.jobType}</span>
                      {job.salaryRange?.max > 0 && <span className="job-meta-item">💰 ₹{job.salaryRange.min}–{job.salaryRange.max}K</span>}
                    </div>
                    <div className="job-skills">
                      {job.requiredSkills?.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/jobs" className="btn btn-primary btn-lg">View All Jobs →</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a56db, #1e40af)', padding: '60px 24px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 16 }}>Ready to Hire Top Talent?</h2>
        <p style={{ opacity: 0.9, marginBottom: 28, fontSize: 17 }}>Post your job and reach thousands of qualified candidates today.</p>
        <Link to="/register?role=recruiter" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>Get Started as Recruiter →</Link>
      </section>

      <Footer />
    </div>
  );
}
