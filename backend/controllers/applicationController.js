const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { calculateMatch } = require('../utils/matchEngine');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate only)
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Get candidate profile
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    // Ensure candidate has uploaded a resume
    if (!candidate.resume || !candidate.resume.filename) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload your resume before applying to jobs' 
      });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      candidate: candidate._id,
      job: jobId
    });

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    // Calculate match score & keywords using ATS engine
    const matchAnalysis = calculateMatch(candidate.skills, job.requiredSkills);

    // Create application
    const application = await Application.create({
      candidate: candidate._id,
      job: jobId,
      matchScore: matchAnalysis.matchScore,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      status: 'Applied'
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get applications
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'candidate') {
      // Find candidate profile
      const candidate = await Candidate.findOne({ user: req.user.id });
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate profile not found' });
      }

      // Find applications by this candidate
      applications = await Application.find({ candidate: candidate._id })
        .populate('job')
        .sort({ appliedAt: -1 });
    } else {
      // Recruiter: Find applications for jobs created by this recruiter
      const recruiterJobs = await Job.find({ recruiter: req.user.id }).select('_id');
      const jobIds = recruiterJobs.map(job => job._id);

      const filter = { job: { $in: jobIds } };
      
      // Optional filter by specific job
      if (req.query.jobId) {
        filter.job = req.query.jobId;
      }

      // Optional filter by status
      if (req.query.status) {
        filter.status = req.query.status;
      }

      applications = await Application.find(filter)
        .populate({
          path: 'candidate',
          populate: { path: 'user', select: 'name email' }
        })
        .populate('job')
        .sort({ matchScore: -1, appliedAt: -1 }); // Rank by match score by default!
    }

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Recruiter only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    let application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update status on this application' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter statistics
// @route   GET /api/applications/stats
// @access  Private (Recruiter only)
exports.getRecruiterStats = async (req, res) => {
  try {
    // Get all jobs created by this recruiter
    const recruiterJobs = await Job.find({ recruiter: req.user.id });
    const totalJobs = recruiterJobs.length;
    const jobIds = recruiterJobs.map(job => job._id);

    // Get applications count
    const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });

    // Get shortlisted count
    const shortlistedCandidates = await Application.countDocuments({ 
      job: { $in: jobIds },
      status: 'Shortlisted'
    });

    // Get interview scheduled, rejected, hired counts for comprehensive text stats
    const interviewsScheduled = await Application.countDocuments({ 
      job: { $in: jobIds },
      status: 'Interview Scheduled'
    });
    
    const hired = await Application.countDocuments({ 
      job: { $in: jobIds },
      status: 'Hired'
    });

    const rejected = await Application.countDocuments({ 
      job: { $in: jobIds },
      status: 'Rejected'
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalApplicants,
        shortlistedCandidates,
        interviewsScheduled,
        hired,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ATS Matching details for a job & candidates ranking
// @route   GET /api/applications/job/:jobId/match
// @access  Private (Recruiter only)
exports.getAtsMatchDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Verify recruiter owns the job
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view matching details for this job' });
    }

    // Get all applications for this job, sorted by matchScore descending (Candidate Ranking)
    const applications = await Application.find({ job: jobId })
      .populate({
        path: 'candidate',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ matchScore: -1, appliedAt: -1 });

    res.status(200).json({
      success: true,
      job: {
        title: job.title,
        company: job.company,
        description: job.description,
        requiredSkills: job.requiredSkills
      },
      rankings: applications.map((app, index) => ({
        rank: index + 1,
        applicationId: app._id,
        candidateId: app.candidate._id,
        name: app.candidate.user.name,
        email: app.candidate.user.email,
        phone: app.candidate.phone,
        matchScore: app.matchScore,
        matchedSkills: app.matchedSkills,
        missingSkills: app.missingSkills,
        status: app.status,
        resumeFilename: app.candidate.resume ? app.candidate.resume.filename : ''
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
