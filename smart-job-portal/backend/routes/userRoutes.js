const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResumeFile, uploadProfilePhoto, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-resume', protect, ...uploadResumeFile);
router.post('/upload-photo', protect, ...uploadProfilePhoto);
router.put('/change-password', protect, changePassword);

module.exports = router;
