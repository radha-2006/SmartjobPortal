const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeFile: { type: String, required: true },
  resumePublicId: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'applied',
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
  appliedDate: { type: Date, default: Date.now },
  recruiterNotes: { type: String, default: '' },
  interviewDate: { type: Date },
  interviewLocation: { type: String },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
