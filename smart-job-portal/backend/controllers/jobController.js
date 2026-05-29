const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');

// @desc Get all jobs with filters
// @route GET /api/jobs
const getJobs = asyncHandler(async (req, res) => {
  const { keyword, location, skills, jobType, experience, minSalary, maxSalary, category, page = 1, limit = 10 } = req.query;
  const query = { status: 'active' };

  if (keyword) query.$text = { $search: keyword };
  if (location) query.location = { $regex: location, $options: 'i' };
  if (jobType) query.jobType = jobType;
  if (experience) query.experienceRequired = { $regex: experience, $options: 'i' };
  if (category) query.category = category;
  if (skills) {
    const skillArr = skills.split(',').map(s => s.trim());
    query.requiredSkills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
  }
  if (minSalary) query['salaryRange.min'] = { $gte: Number(minSalary) };
  if (maxSalary) query['salaryRange.max'] = { $lte: Number(maxSalary) };

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(query).populate('recruiter', 'name companyName companyLogo email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(query),
  ]);

  res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc Get single job
// @route GET /api/jobs/:id
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('recruiter', 'name companyName companyLogo email companyWebsite');
  if (!job) { res.status(404); throw new Error('Job not found'); }
  job.views++;
  await job.save();
  res.json(job);
});

// @desc Create job
// @route POST /api/jobs
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, recruiter: req.user._id, companyName: req.user.companyName });
  res.status(201).json(job);
});

// @desc Update job
// @route PUT /api/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// @desc Delete job
// @route DELETE /api/jobs/:id
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await job.deleteOne();
  res.json({ message: 'Job removed' });
});

// @desc Get recruiter's own jobs
// @route GET /api/jobs/myjobs
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs };
