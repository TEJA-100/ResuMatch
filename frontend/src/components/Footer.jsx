import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} ResuMatch. All rights reserved.</p>
        <p className="mt-1 text-slate-400">ResuMatch ATS — AI-Driven Resume Matching & Applicant Tracking System</p>
      </div>
    </footer>
  );
};

export default Footer;
