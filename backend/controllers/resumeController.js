const Candidate = require('../models/Candidate');
const { parseResumeText } = require('../utils/resumeParser');
const { extractSkills } = require('../utils/matchEngine');
const fs = require('fs');

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

// Helper for rule-based fallback ATS analysis
const calculateFallbackAnalysis = (text, filename) => {
  const extractedSkills = extractSkills(text);
  
  // Calculate component scores
  const skillsScore = Math.min(100, Math.max(30, 30 + extractedSkills.length * 10));
  const textLower = text.toLowerCase();
  
  // Keywords check
  const importantKeywords = ['agile', 'scrum', 'git', 'github', 'docker', 'kubernetes', 'aws', 'cloud', 'rest api', 'graphql', 'ci/cd', 'devops', 'linux', 'testing', 'jest'];
  const foundKeywords = importantKeywords.filter(kw => textLower.includes(kw));
  const missingKeywords = importantKeywords.filter(kw => !textLower.includes(kw));
  const recommendedKeywords = ['microservices', 'system design', 'scalability', 'clean code', 'typescript'];
  
  const keywordScore = Math.min(100, Math.max(30, 20 + foundKeywords.length * 10));
  
  // Experience checks
  const expKeywords = ['experience', 'years', 'led', 'managed', 'developed', 'architected', 'implemented', 'designed'];
  const foundExp = expKeywords.filter(kw => textLower.includes(kw));
  const experienceScore = Math.min(100, Math.max(40, 40 + foundExp.length * 8));
  
  // Formatting checks
  const sections = ['education', 'experience', 'skills', 'projects', 'summary', 'certifications'];
  const foundSections = sections.filter(sec => textLower.includes(sec));
  const formattingScore = Math.min(100, Math.max(50, 40 + foundSections.length * 10));
  
  // Grammar check
  const weakVerbs = ['worked on', 'helped build', 'responsible for', 'assisted in', 'handled'];
  const foundWeak = weakVerbs.filter(v => textLower.includes(v));
  const grammarScore = Math.max(50, 100 - foundWeak.length * 10);
  
  // Education checks
  const eduKeywords = ['bachelor', 'master', 'degree', 'university', 'college', 'phd', 'gpa', 'certification', 'certified'];
  const foundEdu = eduKeywords.filter(kw => textLower.includes(kw));
  const educationScore = Math.min(100, Math.max(50, 50 + foundEdu.length * 10));

  // Overall score calculation (Skills: 30%, Keyword: 20%, Exp: 20%, Edu: 10%, Formatting: 10%, Grammar: 10%)
  const overallScore = Math.round(
    (skillsScore * 0.30) +
    (keywordScore * 0.20) +
    (experienceScore * 0.20) +
    (educationScore * 0.10) +
    (formattingScore * 0.10) +
    (grammarScore * 0.10)
  );

  // Generate lists
  const strengths = [];
  if (skillsScore >= 75) strengths.push('Strong technical skills section matching industry standards.');
  if (formattingScore >= 80) strengths.push('Excellent layout structure with distinct professional sections.');
  if (experienceScore >= 70) strengths.push('Strong usage of professional experience terms.');
  if (strengths.length === 0) strengths.push('Clear personal contact details and education history.');

  const improvements = [];
  if (skillsScore < 70) improvements.push('Expand your skills list to cover core framework and tooling names.');
  if (keywordScore < 70) improvements.push('Missing essential developer keywords like Docker, Kubernetes, or CI/CD.');
  if (grammarScore < 80) improvements.push('Contains weak action verbs like "worked on" or "assisted with".');
  if (experienceScore < 70) improvements.push('Incorporate more quantitative results/metrics into your experience bullets.');
  if (improvements.length === 0) improvements.push('Consider adding relevant professional certifications.');

  const grammarMistakes = [];
  if (textLower.includes('worked on')) grammarMistakes.push({ error: 'worked on', suggestion: 'developed' });
  if (textLower.includes('helped build')) grammarMistakes.push({ error: 'helped build', suggestion: 'engineered' });
  if (textLower.includes('responsible for')) grammarMistakes.push({ error: 'responsible for', suggestion: 'led' });
  if (textLower.includes('assisted in')) grammarMistakes.push({ error: 'assisted in', suggestion: 'coordinated' });
  if (grammarMistakes.length === 0) {
    grammarMistakes.push({ error: 'made use of', suggestion: 'leveraged' });
  }

  const getStatus = (score) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor Compatibility';
  };

  return {
    filename,
    scores: {
      overall: overallScore,
      skills: skillsScore,
      keyword: keywordScore,
      experience: experienceScore,
      formatting: formattingScore,
      grammar: grammarScore,
      education: educationScore
    },
    strengths,
    improvements,
    keywords: {
      found: foundKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      missing: missingKeywords.slice(0, 5).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      recommended: recommendedKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1))
    },
    grammar: {
      mistakes: grammarMistakes,
      spellingErrors: [],
      repeatedWords: []
    },
    suggestions: {
      summary: 'Ditch the objective statement; replace it with a 3-sentence summary highlighting your primary stacks and metrics.',
      skills: 'Ensure your skills section is separated logically: Languages, Frameworks, Libraries, and Developer Tools.',
      experience: 'Use the STAR format: Situation, Task, Action, and Result. Include direct metrics.',
      projects: 'Detail 2-3 prominent open-source or commercial projects, highlighting the system architecture challenges.',
      formatting: 'Keep the resume to a single page if under 5 years of experience. Use standard margins.'
    },
    indicators: [
      {
        name: 'ATS Compatibility',
        value: overallScore,
        status: getStatus(overallScore),
        tip: 'Optimize your formatting and keywords to boost your matching rate.'
      },
      {
        name: 'Keyword Coverage',
        value: keywordScore,
        status: getStatus(keywordScore),
        tip: 'Incorporate missing industry tools to rank higher.'
      },
      {
        name: 'Formatting Quality',
        value: formattingScore,
        status: getStatus(formattingScore),
        tip: 'Ensure your sections use standard, recognizable headings.'
      },
      {
        name: 'Grammar Quality',
        value: grammarScore,
        status: getStatus(grammarScore),
        tip: 'Replace weak passive verbs with strong action verbs.'
      },
      {
        name: 'Experience Strength',
        value: experienceScore,
        status: getStatus(experienceScore),
        tip: 'Add metrics showing the direct business outcome of your code.'
      }
    ]
  };
};

// Helper for Gemini AI ATS analysis
const analyzeWithGemini = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a professional ATS (Applicant Tracking System) resume parser and optimizer.
Analyze the following resume text extracted from the file "${filename}".
Calculate an ATS Score out of 100 based on:
- Skills Match (30%)
- Keyword Optimization (20%)
- Experience Quality (20%)
- Education & Certifications (10%)
- Resume Structure & Formatting (10%)
- Grammar & Vocabulary Quality (10%)

Generate a detailed JSON report with the following structure:
{
  "scores": {
    "overall": number (0-100),
    "skills": number (0-100),
    "keyword": number (0-100),
    "experience": number (0-100),
    "formatting": number (0-100),
    "grammar": number (0-100),
    "education": number (0-100)
  },
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "keywords": {
    "found": ["keyword 1", "keyword 2", ...],
    "missing": ["keyword 1", "keyword 2", ...],
    "recommended": ["keyword 1", "keyword 2", ...]
  },
  "grammar": {
    "mistakes": [
      {"error": "weak/wrong phrase", "suggestion": "stronger/correct replacement"}
    ],
    "spellingErrors": [],
    "repeatedWords": []
  },
  "suggestions": {
    "summary": "suggestion for summary",
    "skills": "suggestion for skills",
    "experience": "suggestion for experience",
    "projects": "suggestion for projects",
    "formatting": "suggestion for formatting"
  },
  "indicators": [
    {
      "name": "ATS Compatibility",
      "value": number (0-100),
      "status": "Excellent" | "Needs Improvement" | "Poor Compatibility",
      "tip": "brief tip"
    },
    ... (for ATS Compatibility, Keyword Coverage, Formatting Quality, Grammar Quality, Experience Strength)
  ]
}

Ensure the response is STRICTLY valid JSON. Do not include markdown formatting or backticks, just the raw JSON string.

Resume text:
${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resData = await response.json();
    const resultText = resData.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini ATS analysis error:", error);
    return null;
  }
};

// @desc    Temporarily upload and analyze resume for ATS Score
// @route   POST /api/candidates/resume/analyze
// @access  Private (Candidate only)
exports.analyzeResume = async (req, res) => {
  let filepath = '';
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    filepath = req.file.path;
    const mimetype = req.file.mimetype;

    // Parse text from PDF/DOCX
    const parsedText = await parseResumeText(filepath, mimetype);

    // Analyze using Gemini, or fallback to rule-based analysis
    let analysis = await analyzeWithGemini(parsedText, req.file.originalname);
    if (!analysis) {
      analysis = calculateFallbackAnalysis(parsedText, req.file.originalname);
    }

    // Explicitly delete file from disk to ensure temporary-only processing
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      filepath = ''; // reset so finally block doesn't attempt to unlink again
    }

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Analyze resume controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // Safety check: ensure file is cleaned up if error occurred
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error('Failed to clean up temp resume file:', err);
      }
    }
  }
};
