const Candidate = require('../models/Candidate');
const User = require('../models/User');

// @desc    Get current candidate profile
// @route   GET /api/candidates/me
// @access  Private
exports.getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/me
// @access  Private (Candidate only)
exports.updateCandidateProfile = async (req, res) => {
  try {
    let candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    const { phone, bio, skills, education, experience } = req.body;

    // Handle profile update fields
    if (phone !== undefined) candidate.phone = phone;
    if (bio !== undefined) candidate.bio = bio;
    
    // Update skills: support both array and comma-separated string
    if (skills !== undefined) {
      candidate.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    if (education !== undefined) candidate.education = education;
    if (experience !== undefined) candidate.experience = experience;

    await candidate.save();

    // Also update User name if sent
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    // Populate user and return
    const updatedCandidate = await Candidate.findById(candidate._id).populate('user', 'name email');

    res.status(200).json({ success: true, data: updatedCandidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all candidates (Recruiters only)
// @route   GET /api/candidates
// @access  Private (Recruiter only)
exports.getCandidates = async (req, res) => {
  try {
    const query = {};

    // Filter by skill
    if (req.query.skills) {
      const skillsQuery = req.query.skills.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.skills = { $in: skillsQuery };
    }

    let candidates = await Candidate.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Handle basic search (by candidate name)
    if (req.query.search) {
      const searchLower = req.query.search.toLowerCase();
      candidates = candidates.filter(cand => 
        cand.user && cand.user.name.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
