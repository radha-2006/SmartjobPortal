const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUser, getAllJobs, getAllApplications } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);

module.exports = router;
