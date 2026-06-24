const COMMON_SKILLS_DICTIONARY = [
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'typescript',
  'html', 'css', 'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express',
  'django', 'flask', 'spring boot', 'laravel', 'mongodb', 'postgresql', 'mysql', 'sqlite',
  'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'agile',
  'scrum', 'project management', 'communication', 'problem solving', 'teamwork',
  'machine learning', 'data analysis', 'sql', 'nosql', 'tailwind', 'bootstrap', 'redux',
  'graphql', 'rest api', 'devops', 'ci/cd', 'linux', 'unittest', 'jest', 'mocha', 'cypress',
  'fastapi', 'numpy', 'pandas', 'scikit-learn', 'tensorflow', 'keras', 'pytorch', 'flutter', 'react native'
];

/**
 * Extract skills from resume text using common dictionary
 * @param {string} text - Raw parsed resume text
 * @returns {string[]} - Array of matched skill strings
 */
const extractSkills = (text) => {
  if (!text) return [];
  const normalizedText = text.toLowerCase();
  
  const extracted = [];
  COMMON_SKILLS_DICTIONARY.forEach(skill => {
    // Escape special regex characters in skill name
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Custom regex based on skill name characteristics (e.g. C++, .NET, C#)
    let regex;
    if (skill.includes('+') || skill.includes('.') || skill.includes('#')) {
      regex = new RegExp(escapedSkill, 'i');
    } else {
      regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    }
    
    if (regex.test(normalizedText)) {
      // Map to correct display name format
      const displayName = skill.split(' ')
        .map(w => w === 'next.js' ? 'Next.js' : w === 'node.js' ? 'Node.js' : w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      extracted.push(displayName);
    }
  });
  
  return extracted;
};

/**
 * Calculate match score between candidate skills and job requirements
 * @param {string[]} candidateSkills - Candidate's skills
 * @param {string[]} jobRequiredSkills - Job's required skills
 * @returns {object} - { matchScore, matchedSkills, missingSkills }
 */
const calculateMatch = (candidateSkills = [], jobRequiredSkills = []) => {
  if (!jobRequiredSkills || jobRequiredSkills.length === 0) {
    return {
      matchScore: 100,
      matchedSkills: [],
      missingSkills: []
    };
  }

  // Normalize candidate skills for comparison
  const normCandidateSkills = candidateSkills.map(s => s.trim().toLowerCase());
  
  const matched = [];
  const missing = [];

  jobRequiredSkills.forEach(skill => {
    const cleanSkill = skill.trim();
    const cleanSkillLower = cleanSkill.toLowerCase();
    
    // Direct check or simple partial check for match
    if (normCandidateSkills.includes(cleanSkillLower)) {
      matched.push(cleanSkill);
    } else {
      // Try finding if candidate skills contain this skill or vice-versa
      const hasMatch = normCandidateSkills.some(candSkill => 
        candSkill.includes(cleanSkillLower) || cleanSkillLower.includes(candSkill)
      );
      if (hasMatch) {
        matched.push(cleanSkill);
      } else {
        missing.push(cleanSkill);
      }
    }
  });

  const matchScore = Math.round((matched.length / jobRequiredSkills.length) * 100);

  return {
    matchScore,
    matchedSkills: matched,
    missingSkills: missing
  };
};

module.exports = {
  extractSkills,
  calculateMatch
};
