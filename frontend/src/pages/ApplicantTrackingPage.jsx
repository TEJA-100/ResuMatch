import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const ApplicantTrackingPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        // Fetch all recruiter applications and find the specific one
        const res = await API.get('/applications');
        const app = res.data.data.find((a) => a._id === applicationId);
        if (!app) {
          setError('Application not found');
        } else {
          setApplication(app);
          setStatus(app.status);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      await API.put(`/applications/${applicationId}`, { status });
      setSuccess('Application status updated successfully!');
      
      // Update local state representation
      setApplication((prev) => ({
        ...prev,
        status: status
      }));

      // Redirect back to recruiter dashboard after short delay
      setTimeout(() => {
        navigate('/recruiter-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center text-slate-600">
        Loading applicant details...
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded mb-4">
          {error || 'Application not found'}
        </div>
        <Link to="/recruiter-dashboard" className="text-blue-600 hover:underline">
          Back to Recruiter Dashboard
        </Link>
      </div>
    );
  }

  const { candidate, job, matchScore, appliedAt } = application;
  const candidateName = candidate?.user?.name || 'Unknown Candidate';
  const candidateEmail = candidate?.user?.email || '';

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Track Applicant Status</h1>
            <p className="text-xs text-slate-500 mt-1">Review application state and transition status</p>
          </div>
          <Link
            to="/recruiter-dashboard"
            className="text-xs text-slate-500 hover:underline font-semibold"
          >
            Cancel
          </Link>
        </div>

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Profile Info Summary */}
        <div className="space-y-4 mb-8 text-sm">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</span>
            <span className="font-semibold text-slate-900">{candidateName}</span>
            <span className="text-slate-500"> ({candidateEmail})</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied For</span>
            <span className="font-semibold text-slate-900">{job?.title}</span>
            <span className="text-slate-500"> at {job?.company}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied Date</span>
              <span className="text-slate-800">{appliedAt ? new Date(appliedAt).toLocaleDateString() : '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">ATS Match Score</span>
              <span className="font-bold text-blue-600">{matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown Form */}
        <form onSubmit={handleStatusUpdate} className="space-y-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Update Pipeline Status
            </label>
            <select
              className="form-input text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={updating}
            >
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer text-center"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
            <Link
              to={`/jobs/${job?._id}/match`}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded text-sm text-center"
            >
              View ATS Details
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantTrackingPage;
