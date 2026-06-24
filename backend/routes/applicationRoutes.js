const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getApplications,
  updateApplicationStatus,
  getRecruiterStats,
  getAtsMatchDetails
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('candidate'), applyToJob)
  .get(getApplications);

router.get('/stats', authorize('recruiter'), getRecruiterStats);
router.get('/job/:jobId/match', authorize('recruiter'), getAtsMatchDetails);
router.put('/:id', authorize('recruiter'), updateApplicationStatus);

module.exports = router;
