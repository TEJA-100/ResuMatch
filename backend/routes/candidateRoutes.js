const express = require('express');
const router = express.Router();
const {
  getCandidateProfile,
  updateCandidateProfile,
  getCandidates
} = require('../controllers/candidateController');
const { uploadResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/me', getCandidateProfile);
router.put('/me', authorize('candidate'), updateCandidateProfile);
router.get('/', authorize('recruiter'), getCandidates);
router.post('/resume/upload', authorize('candidate'), upload.single('resume'), uploadResume);

module.exports = router;
