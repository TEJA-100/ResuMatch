import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  // If already logged in, redirect to respective dashboard
  if (user) {
    return user.role === 'recruiter' ? (
      <Navigate to="/recruiter-dashboard" replace />
    ) : (
      <Navigate to="/candidate-dashboard" replace />
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          ResuMatch
        </h1>
        <p className="mt-2 text-xl font-semibold text-blue-600">
          AI-Driven Applicant Tracking & Resume Matching System
        </p>
        <p className="mt-6 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Simplify your hiring process. ResuMatch parses candidate resumes (PDF/DOCX), extracts key skills, and calculates percentage match scores against job requirements instantly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-none cursor-pointer"
          >
            Login to Account
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto text-center px-6 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium rounded-md cursor-pointer"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900">AI Resume Parsing</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Upload PDF or Word documents. Our parsing system extracts raw text and discovers candidate skills automatically.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900">ATS Match Scoring</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Compare candidate skillsets directly against job profiles to compute a percentage alignment score instantly.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900">Applicant Tracking</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Track and update applications through different recruitment states from Applied to Hired or Rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
