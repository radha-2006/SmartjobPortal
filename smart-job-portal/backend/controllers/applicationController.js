const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @desc Apply for a job
// @route POST /api/applications
const applyJob = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;

  const job = await Job.findById(jobId).populate('recruiter', 'name email');
  if (!job) { res.status(404); throw new Error('Job not found'); }
  if (job.status !== 'active') { res.status(400); throw new Error('This job is no longer active'); }

  const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already applied for this job'); }

  const resumeFile = req.user.resumeFile;
  if (!resumeFile) { res.status(400); throw new Error('Please upload a resume first'); }

  const application = await Application.create({
    job: jobId, applicant: req.user._id, resumeFile,
    coverLetter, statusHistory: [{ status: 'applied', note: 'Application submitted' }],
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

  // Notify applicant
  try {
    const tpl = emailTemplates.applicationReceived(req.user.name, job.jobTitle, job.companyName);
    await sendEmail({ to: req.user.email, ...tpl });
  } catch (e) { console.log('Email error:', e.message); }

  // Notify recruiter
  try {
    const tpl = emailTemplates.newApplication(job.recruiter.name, req.user.name, job.jobTitle);
    await sendEmail({ to: job.recruiter.email, ...tpl });
  } catch (e) { console.log('Email error:', e.message); }

  res.status(201).json(application);
});

// @desc Get applicant's applications
// @route GET /api/applications/my
const getMyApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id })
    .populate('job', 'jobTitle companyName location jobType salaryRange companyLogo status')
    .sort({ createdAt: -1 });
  res.json(apps);
});

// @desc Get applications for a job (recruiter)
// @route GET /api/applications/job/:jobId
const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  const apps = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email phone skills education experience resumeFile profilePhoto location')
    .sort({ createdAt: -1 });
  res.json(apps);
});

// @desc Update application status (recruiter)
// @route PUT /api/applications/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, interviewDate, interviewLocation } = req.body;
  const app = await Application.findById(req.params.id).populate('job', 'jobTitle recruiter');
  if (!app) { res.status(404); throw new Error('Application not found'); }

  if (app.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  app.status = status;
  app.statusHistory.push({ status, note: note || '', changedAt: new Date() });
  if (interviewDate) app.interviewDate = interviewDate;
  if (interviewLocation) app.interviewLocation = interviewLocation;
  await app.save();

  // Notify applicant
  try {
    const applicant = await User.findById(app.applicant);
    const tpl = emailTemplates.statusUpdate(applicant.name, app.job.jobTitle, status);
    await sendEmail({ to: applicant.email, ...tpl });
  } catch (e) { console.log('Email error:', e.message); }

  res.json(app);
});

// @desc Withdraw application
// @route PUT /api/applications/:id/withdraw
const withdrawApplication = asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
  if (!app) { res.status(404); throw new Error('Application not found'); }
  if (['offered', 'rejected'].includes(app.status)) {
    res.status(400); throw new Error('Cannot withdraw at this stage');
  }
  app.status = 'withdrawn';
  app.statusHistory.push({ status: 'withdrawn', note: 'Withdrawn by applicant' });
  await app.save();
  res.json({ message: 'Application withdrawn' });
});

module.exports = { applyJob, getMyApplications, getJobApplications, updateStatus, withdrawApplication };
