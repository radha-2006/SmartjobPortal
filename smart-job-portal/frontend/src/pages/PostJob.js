import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Healthcare', 'Education', 'Other'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    jobTitle: '', jobDescription: '', requiredSkills: [], location: '',
    jobType: 'Full-time', experienceRequired: '0-1 years', category: 'Technology',
    salaryMin: '', salaryMax: '', openings: 1, deadline: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setForm({ ...form, requiredSkills: form.requiredSkills.filter(x => x !== s) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle || !form.jobDescription || !form.location) return toast.error('Please fill in all required fields');
    if (form.requiredSkills.length === 0) return toast.error('Add at least one required skill');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salaryRange: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'INR' },
      };
      await axios.post('/api/jobs', payload);
      toast.success('Job posted successfully!');
      navigate('/my-jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="container" style={{ maxWidth: 760 }}>
          <h1 className="section-title">Post a New Job</h1>
          <p className="section-sub">Fill in the details to attract the right candidates</p>

          <form onSubmit={handleSubmit} className="card">
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior React Developer" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type *</label>
                  <select className="form-input" name="jobType" value={form.jobType} onChange={handleChange}>
                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Hyderabad, India or Remote" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input className="form-input" name="experienceRequired" value={form.experienceRequired} onChange={handleChange} placeholder="e.g. 2-4 years" />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Openings</label>
                  <input className="form-input" type="number" name="openings" value={form.openings} onChange={handleChange} min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Salary (INR/year)</label>
                  <input className="form-input" type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="e.g. 500000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (INR/year)</label>
                  <input className="form-input" type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="e.g. 1200000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input className="form-input" type="date" name="deadline" value={form.deadline} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Job Description *</h3>
              <textarea
                className="form-input"
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                rows={8}
                placeholder="Describe the role, responsibilities, requirements, benefits..."
                required
              />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Required Skills *</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  className="form-input"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter or Add"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-outline" onClick={addSkill}>Add</button>
              </div>
              <div className="job-skills">
                {form.requiredSkills.map(s => (
                  <span key={s} className="skill-tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                {form.requiredSkills.length === 0 && <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>No skills added yet</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/my-jobs')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : '📢 Post Job'}</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />

      <style>{`
        .form-section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--gray-100); }
        .form-section:last-of-type { border-bottom: none; margin-bottom: 0; }
        .form-section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--dark); }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
