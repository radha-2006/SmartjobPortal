const express = require('express');
const router = express.Router();
const { applyJob, getMyApplications, getJobApplications, updateStatus, withdrawApplication } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('jobseeker'), applyJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateStatus);
router.put('/:id/withdraw', protect, authorize('jobseeker'), withdrawApplication);

module.exports = router;
