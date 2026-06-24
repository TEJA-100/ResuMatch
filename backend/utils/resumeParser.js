const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract raw text from resume file
 * @param {string} filepath - Path to the file on disk
 * @param {string} mimetype - Mime type of the file
 */
const parseResumeText = async (filepath, mimetype) => {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error('File not found at path: ' + filepath);
    }
    
    const dataBuffer = fs.readFileSync(filepath);

    if (mimetype === 'application/pdf' || filepath.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      filepath.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file format. Please upload PDF or DOCX.');
    }
  } catch (error) {
    console.error('Resume parsing utility error:', error);
    throw error;
  }
};

module.exports = { parseResumeText };
