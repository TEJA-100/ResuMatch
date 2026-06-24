const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All job routes require login

router.route('/')
  .post(authorize('recruiter'), createJob)
  .get(getJobs);

router.route('/:id')
  .get(getJobById)
  .put(authorize('recruiter'), updateJob)
  .delete(authorize('recruiter'), deleteJob);

module.exports = router;
