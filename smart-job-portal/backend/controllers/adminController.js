const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc Admin dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalJobs, totalApplications, activeJobs, jobSeekers, recruiters] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'jobseeker' }),
    User.countDocuments({ role: 'recruiter' }),
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
  const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('jobTitle companyName status createdAt');

  const appByStatus = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const jobsByCategory = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  res.json({ totalUsers, totalJobs, totalApplications, activeJobs, jobSeekers, recruiters, recentUsers, recentJobs, appByStatus, jobsByCategory });
});

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc Toggle user active status
// @route PUT /api/admin/users/:id/toggle
const toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

// @desc Get all jobs (admin)
// @route GET /api/admin/jobs
const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('recruiter', 'name email companyName').sort({ createdAt: -1 });
  res.json(jobs);
});

// @desc Get all applications (admin)
// @route GET /api/admin/applications
const getAllApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find()
    .populate('job', 'jobTitle companyName')
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(apps);
});

module.exports = { getDashboardStats, getAllUsers, toggleUser, getAllJobs, getAllApplications };
