const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    const { 
      title, 
      company, 
      location, 
      experience, 
      employmentType, 
      description, 
      requiredSkills,
      applicationDeadline,
      salaryRange,
      preferredQualifications,
      requiredQualifications,
      responsibilities,
      hiringName,
      hiringEmail,
      hiringLinkedin
    } = req.body;

    if (
      !title || !company || !location || !experience || !employmentType || 
      !description || !requiredSkills || !applicationDeadline || !salaryRange || 
      !preferredQualifications || !requiredQualifications || !responsibilities || 
      !hiringName || !hiringEmail || !hiringLinkedin
    ) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // Check if skills is a string and convert to array
    let skillsArray = [];
    if (requiredSkills) {
      skillsArray = Array.isArray(requiredSkills) 
        ? requiredSkills 
        : requiredSkills.split(',').map(s => s.trim());
    }

    const job = await Job.create({
      title,
      company,
      location,
      experience,
      employmentType,
      description,
      requiredSkills: skillsArray,
      applicationDeadline,
      salaryRange,
      preferredQualifications,
      requiredQualifications,
      responsibilities,
      hiringName,
      hiringEmail,
      hiringLinkedin,
      recruiter: req.user.id
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    const query = { status: 'open' };

    // If recruiter requests their own jobs, filter by recruiter id
    if (req.user.role === 'recruiter' && req.query.myJobs === 'true') {
      delete query.status; // recruiter can see their closed jobs too
      query.recruiter = req.user.id;
    }

    // Add basic search filter if present
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex }
      ];
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is the job owner
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
    }

    const { 
      title, 
      company, 
      location, 
      experience, 
      employmentType, 
      description, 
      requiredSkills, 
      status,
      applicationDeadline,
      salaryRange,
      preferredQualifications,
      requiredQualifications,
      responsibilities,
      hiringName,
      hiringEmail,
      hiringLinkedin
    } = req.body;

    let skillsArray = job.requiredSkills;
    if (requiredSkills) {
      skillsArray = Array.isArray(requiredSkills) 
        ? requiredSkills 
        : requiredSkills.split(',').map(s => s.trim());
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title: title || job.title,
        company: company || job.company,
        location: location || job.location,
        experience: experience || job.experience,
        employmentType: employmentType || job.employmentType,
        description: description || job.description,
        requiredSkills: skillsArray,
        status: status || job.status,
        applicationDeadline: applicationDeadline || job.applicationDeadline,
        salaryRange: salaryRange || job.salaryRange,
        preferredQualifications: preferredQualifications || job.preferredQualifications,
        requiredQualifications: requiredQualifications || job.requiredQualifications,
        responsibilities: responsibilities || job.responsibilities,
        hiringName: hiringName || job.hiringName,
        hiringEmail: hiringEmail || job.hiringEmail,
        hiringLinkedin: hiringLinkedin || job.hiringLinkedin
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is the job owner
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this job' });
    }

    // Delete associated applications first
    await Application.deleteMany({ job: job._id });

    // Use findByIdAndDelete instead of job.remove()
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Job and all its applications deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
