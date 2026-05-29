const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { uploadResume, uploadProfile, cloudinary } = require('../config/cloudinary');

// @desc Get user profile
// @route GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc Update user profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'bio', 'location', 'skills', 'education',
    'experience', 'linkedIn', 'portfolio', 'companyName', 'companyWebsite', 'companyDescription'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json(user);
});

// @desc Upload resume
// @route POST /api/users/upload-resume
const uploadResumeFile = [
  uploadResume.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
    if (req.user.resumePublicId) {
      try { await cloudinary.uploader.destroy(req.user.resumePublicId, { resource_type: 'raw' }); } catch {}
    }
    const user = await User.findByIdAndUpdate(req.user._id,
      { resumeFile: req.file.path, resumePublicId: req.file.filename }, { new: true }).select('-password');
    res.json({ message: 'Resume uploaded', resumeFile: user.resumeFile });
  }),
];

// @desc Upload profile photo
// @route POST /api/users/upload-photo
const uploadProfilePhoto = [
  uploadProfile.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
    const user = await User.findByIdAndUpdate(req.user._id,
      { profilePhoto: req.file.path }, { new: true }).select('-password');
    res.json({ message: 'Photo uploaded', profilePhoto: user.profilePhoto });
  }),
];

// @desc Change password
// @route PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(400); throw new Error('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully' });
});

module.exports = { getProfile, updateProfile, uploadResumeFile, uploadProfilePhoto, changePassword };
