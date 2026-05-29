const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true, trim: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  jobDescription: { type: String, required: true },
  requiredSkills: [{ type: String }],
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], default: 'Full-time' },
  experienceRequired: { type: String, default: '0-1 years' },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  deadline: { type: Date },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  category: { type: String, default: 'Technology' },
  openings: { type: Number, default: 1 },
}, { timestamps: true });

jobSchema.index({ jobTitle: 'text', companyName: 'text', requiredSkills: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
