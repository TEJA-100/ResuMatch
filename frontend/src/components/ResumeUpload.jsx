import React, { useState, useRef } from 'react';
import API from '../services/api';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file) => {
    setStatus({ type: '', message: '' });
    
    // File validation
    const allowedExtensions = /(\.pdf|\.docx)$/i;
    if (!allowedExtensions.exec(file.name)) {
      setStatus({ type: 'error', message: 'Invalid file format. Please upload PDF or DOCX.' });
      return;
    }

    if (file.size > 5000000) { // 5MB limit
      setStatus({ type: 'error', message: 'File is too large. Maximum size is 5MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await API.post('/candidates/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatus({ type: 'success', message: 'Resume uploaded and parsed successfully!' });
      if (onUploadSuccess) {
        onUploadSuccess(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to upload and parse resume. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center bg-white ${
          dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
        />
        
        <svg
          className="mx-auto h-10 w-10 text-slate-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <p className="text-sm text-slate-700 font-medium">
          Drag and drop your resume here, or{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline font-semibold cursor-pointer focus:outline-none"
            onClick={onButtonClick}
            disabled={uploading}
          >
            browse files
          </button>
        </p>
        <p className="text-xs text-slate-400 mt-1">Supports PDF and DOCX formats up to 5MB</p>
      </div>

      {uploading && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs text-center rounded">
          Uploading and parsing resume... Please wait.
        </div>
      )}

      {status.message && (
        <div
          className={`mt-3 p-3 border rounded text-xs text-center ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
