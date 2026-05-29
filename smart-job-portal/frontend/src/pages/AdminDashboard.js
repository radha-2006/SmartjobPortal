import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1a56db', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [toggling, setToggling] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleUser = async (id) => {
    setToggling(id);
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
    finally { setToggling(null); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const appStatusData = stats?.appByStatus?.map(s => ({ name: s._id.replace('_', ' '), value: s.count })) || [];
  const categoryData = stats?.jobsByCategory?.map(c => ({ name: c._id, count: c.count })) || [];

  const tabs = ['overview', 'users', 'jobs', 'applications'];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container">
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-sub">Platform overview and management</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '2px solid var(--gray-100)', paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize', color: tab === t ? 'var(--primary)' : 'var(--gray-500)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2 }}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="stats-cards" style={{ marginBottom: 28 }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: 'var(--primary)', icon: '👥' },
                  { label: 'Job Seekers', value: stats.jobSeekers, color: '#8b5cf6', icon: '🎯' },
                  { label: 'Recruiters', value: stats.recruiters, color: 'var(--success)', icon: '🏢' },
                  { label: 'Total Jobs', value: stats.totalJobs, color: 'var(--warning)', icon: '💼' },
                  { label: 'Active Jobs', value: stats.activeJobs, color: 'var(--success)', icon: '✅' },
                  { label: 'Applications', value: stats.totalApplications, color: 'var(--accent)', icon: '📋' },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="stat-card">
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <div className="stat-card-num" style={{ color }}>{value}</div>
                    <div className="stat-card-label">{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Applications by Status</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={appStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {appStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Jobs by Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categoryData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Users</h3>
                  {stats.recentUsers?.map(u => (
                    <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.email}</div>
                      </div>
                      <span className={`badge ${u.role === 'recruiter' ? 'badge-blue' : u.role === 'admin' ? 'badge-red' : 'badge-green'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Jobs</h3>
                  {stats.recentJobs?.map(j => (
                    <div key={j._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{j.jobTitle}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{j.companyName}</div>
                      </div>
                      <span className={`badge ${j.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Users tab */}
          {tab === 'users' && (
            <div className="card">
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="form-input" style={{ flex: 1, minWidth: 200 }} placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                <select className="form-input" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong>{u.companyName && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.companyName}</div>}</td>
                        <td style={{ fontSize: 13 }}>{u.email}</td>
                        <td><span className={`badge ${u.role === 'recruiter' ? 'badge-blue' : u.role === 'admin' ? 'badge-red' : 'badge-green'}`}>{u.role}</span></td>
                        <td style={{ fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => toggleUser(u._id)} disabled={toggling === u._id || u.role === 'admin'}>
                            {toggling === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Jobs tab */}
          {tab === 'jobs' && (
            <AdminJobsTable />
          )}

          {/* Applications tab */}
          {tab === 'applications' && (
            <AdminApplicationsTable />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function AdminJobsTable() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/jobs').then(({ data }) => setJobs(data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Job Title</th><th>Company</th><th>Recruiter</th><th>Status</th><th>Apps</th><th>Posted</th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j._id}>
                <td><Link to={`/jobs/${j._id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>{j.jobTitle}</Link><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{j.location}</div></td>
                <td>{j.companyName}</td>
                <td style={{ fontSize: 13 }}>{j.recruiter?.name}<br /><span style={{ color: 'var(--gray-500)', fontSize: 12 }}>{j.recruiter?.email}</span></td>
                <td><span className={`badge ${j.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{j.status}</span></td>
                <td>{j.applicationCount}</td>
                <td style={{ fontSize: 13 }}>{new Date(j.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminApplicationsTable() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const STATUS_COLORS = { applied:'badge-blue', under_review:'badge-yellow', shortlisted:'badge-green', interview:'badge-purple', offered:'badge-green', rejected:'badge-red', withdrawn:'badge-gray' };

  useEffect(() => {
    axios.get('/api/admin/applications').then(({ data }) => setApps(data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Applicant</th><th>Job</th><th>Company</th><th>Status</th><th>Applied Date</th></tr></thead>
          <tbody>
            {apps.map(a => (
              <tr key={a._id}>
                <td><strong>{a.applicant?.name}</strong><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.applicant?.email}</div></td>
                <td>{a.job?.jobTitle}</td>
                <td>{a.job?.companyName}</td>
                <td><span className={`badge ${STATUS_COLORS[a.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{a.status?.replace('_', ' ')}</span></td>
                <td style={{ fontSize: 13 }}>{new Date(a.appliedDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
