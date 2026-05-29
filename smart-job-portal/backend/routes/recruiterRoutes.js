const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc Get recruiter public profile
router.get('/:id', asyncHandler(async (req, res) => {
  const recruiter = await User.findById(req.params.id).select('name companyName companyLogo companyWebsite companyDescription email createdAt');
  if (!recruiter || recruiter.role !== 'recruiter') { res.status(404); throw new Error('Recruiter not found'); }
  res.json(recruiter);
}));

// @desc Update recruiter company info
router.put('/company', protect, authorize('recruiter'), asyncHandler(async (req, res) => {
  const { companyName, companyWebsite, companyDescription } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { companyName, companyWebsite, companyDescription }, { new: true }).select('-password');
  res.json(user);
}));

module.exports = router;
