const Candidate = require('../models/Candidate');
const { parseResumeText } = require('../utils/resumeParser');
const { extractSkills } = require('../utils/matchEngine');

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private (Candidate only)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    const filepath = req.file.path;
    const mimetype = req.file.mimetype;

    // Parse the file text
    const parsedText = await parseResumeText(filepath, mimetype);

    // Extract skills matching our dictionary
    const extractedSkills = extractSkills(parsedText);

    // Update candidate resume details
    candidate.resume = {
      filename: req.file.originalname,
      filepath: req.file.filename, // Store filename to resolve via static path later
      uploadedAt: new Date(),
      parsedText: parsedText
    };

    // Combine extracted skills with manual skills, avoiding duplicates
    const existingSkillsLower = candidate.skills.map(s => s.toLowerCase());
    extractedSkills.forEach(skill => {
      if (!existingSkillsLower.includes(skill.toLowerCase())) {
        candidate.skills.push(skill);
      }
    });

    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        filename: req.file.originalname,
        skillsExtracted: extractedSkills,
        skillsTotal: candidate.skills
      }
    });
  } catch (error) {
    console.error('Upload resume controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
