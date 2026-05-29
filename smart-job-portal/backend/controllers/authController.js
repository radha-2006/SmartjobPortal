const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @desc Register user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, phone } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const userData = { name, email, password, role: role || 'jobseeker', phone };
  if (role === 'recruiter' && companyName) userData.companyName = companyName;

  const user = await User.create(userData);

  try {
    const tpl = emailTemplates.welcomeEmail(user.name, user.role);
    await sendEmail({ to: user.email, ...tpl });
  } catch (e) { console.log('Email error:', e.message); }

  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, token: generateToken(user._id),
  });
});

// @desc Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated');
  }

  res.json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, profilePhoto: user.profilePhoto,
    companyName: user.companyName, token: generateToken(user._id),
  });
});

// @desc Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a>. Valid for 10 minutes.</p>`,
  });
  res.json({ message: 'Password reset email sent' });
});

// @desc Reset password
// @route PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });

  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful', token: generateToken(user._id) });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
