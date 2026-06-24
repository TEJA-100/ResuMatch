import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';

const ResumeUploadPage = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    // Redirect to candidate dashboard or profile after a short delay
    setTimeout(() => {
      navigate('/candidate-dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-slate-900">Upload Your Resume</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Our parser will scan the document for skills, education, and experiences to build your ATS profile automatically.
        </p>

        <ResumeUpload onUploadSuccess={handleUploadSuccess} />

        <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <h3 className="font-semibold text-slate-950">Important Upload Tips:</h3>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-slate-500">
            <li>We support standard **PDF (.pdf)** and **Word (.docx)** file formats.</li>
            <li>Make sure your file size is **less than 5MB**.</li>
            <li>Ensure the document uses selectable text (scanned image PDFs cannot be parsed).</li>
            <li>Listing standard technology keywords (e.g. React, Python, JavaScript) helps the matching engine.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
