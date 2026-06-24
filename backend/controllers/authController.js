const User = require('../models/User');
const Candidate = require('../models/Candidate');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'resumatch_secret_key_123456', {
    expiresIn: '30d'
  });
};

// @desc    Register a Candidate
// @route   POST /api/auth/register/candidate
// @access  Public
exports.registerCandidate = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'candidate',
      isVerified: true
    });

    // Create associated Candidate profile
    const candidate = await Candidate.create({
      user: user._id,
      phone: phone || '',
      skills: [],
      education: [],
      experience: [],
      resume: {}
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      candidateId: candidate._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a Recruiter
// @route   POST /api/auth/register/recruiter
// @access  Public
exports.registerRecruiter = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'recruiter',
      isVerified: true
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get candidate ID if user is a candidate
    let candidateId = null;
    if (user.role === 'candidate') {
      const candidate = await Candidate.findOne({ user: user._id });
      if (candidate) {
        candidateId = candidate._id;
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      candidateId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let candidateId = null;
    
    if (user.role === 'candidate') {
      const candidate = await Candidate.findOne({ user: user._id });
      if (candidate) {
        candidateId = candidate._id;
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      candidateId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
