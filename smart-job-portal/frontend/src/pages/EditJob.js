import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Healthcare', 'Education', 'Other'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const STATUSES = ['active', 'closed', 'draft'];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    jobTitle: '', jobDescription: '', requiredSkills: [], location: '',
    jobType: 'Full-time', experienceRequired: '', category: 'Technology',
    salaryMin: '', salaryMax: '', openings: 1, deadline: '', status: 'active',
  });

  useEffect(() => {
    axios.get(`/api/jobs/${id}`).then(({ data }) => {
      setForm({
        jobTitle: data.jobTitle, jobDescription: data.jobDescription,
        requiredSkills: data.requiredSkills || [], location: data.location,
        jobType: data.jobType, experienceRequired: data.experienceRequired,
        category: data.category, salaryMin: data.salaryRange?.min || '',
        salaryMax: data.salaryRange?.max || '', openings: data.openings,
        deadline: data.deadline ? data.deadline.split('T')[0] : '',
        status: data.status,
      });
    }).catch(() => { toast.error('Job not found'); navigate('/my-jobs'); })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
    setSkillInput('');
  };
  const removeSkill = (s) => setForm({ ...form, requiredSkills: form.requiredSkills.filter(x => x !== s) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/jobs/${id}`, {
        ...form,
        salaryRange: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'INR' },
      });
      toast.success('Job updated!');
      navigate('/my-jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container" style={{ maxWidth: 760 }}>
          <h1 className="section-title">Edit Job</h1>
          <p className="section-sub">Update the job details below</p>

          <form onSubmit={handleSubmit} className="card">
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange} style={{ maxWidth: 200 }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-input" name="jobType" value={form.jobType} onChange={handleChange}>
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input className="form-input" name="experienceRequired" value={form.experienceRequired} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Openings</label>
                <input className="form-input" type="number" name="openings" value={form.openings} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Min Salary</label>
                <input className="form-input" type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary</label>
                <input className="form-input" type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" name="deadline" value={form.deadline} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Job Description *</label>
              <textarea className="form-input" name="jobDescription" value={form.jobDescription} onChange={handleChange} rows={7} required />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Required Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="form-input" style={{ flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add skill..." />
                <button type="button" className="btn btn-outline" onClick={addSkill}>Add</button>
              </div>
              <div className="job-skills">
                {form.requiredSkills.map(s => (
                  <span key={s} className="skill-tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/my-jobs')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : '💾 Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
