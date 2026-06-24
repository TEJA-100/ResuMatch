import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import JobCard from '../components/JobCard';
import DataTable from '../components/DataTable';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [applyStatus, setApplyStatus] = useState({ type: '', message: '' });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Candidate Profile
      const profileRes = await API.get('/candidates/me');
      setCandidateProfile(profileRes.data.data);

      // 2. Fetch Jobs
      const jobsRes = await API.get('/jobs');
      setJobs(jobsRes.data.data);

      // 3. Fetch My Applications
      const appsRes = await API.get('/applications');
      setApplications(appsRes.data.data);
    } catch (err) {
      console.error('Failed to load candidate dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApply = async (jobId) => {
    setApplyStatus({ type: '', message: '' });
    try {
      await API.post('/applications', { jobId });
      setApplyStatus({ type: 'success', message: 'Applied successfully!' });
      await loadDashboardData();
    } catch (err) {
      setApplyStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to apply' 
      });
    }
  };

  const getStatusColor = (status) => {
    const map = {
      'Applied': 'bg-blue-50 text-blue-700 border-blue-200',
      'Shortlisted': 'bg-purple-50 text-purple-700 border-purple-200',
      'Interview Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
      'Hired': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getAppliedDetails = (jobId) => {
    return applications.find(app => app.job?._id === jobId);
  };

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-600">
        Loading candidate dashboard...
      </div>
    );
  }

  const getJobMatchScore = (jobSkills = []) => {
    if (!candidateProfile || !candidateProfile.skills || candidateProfile.skills.length === 0 || jobSkills.length === 0) {
      return null;
    }
    const candSkillsLower = candidateProfile.skills.map(s => s.trim().toLowerCase());
    const matched = jobSkills.filter(skill => {
      const cleanSkill = skill.trim().toLowerCase();
      return candSkillsLower.includes(cleanSkill) || candSkillsLower.some(cs => cs.includes(cleanSkill) || cleanSkill.includes(cs));
    });
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Welcome, {user?.name}!</h1>
          <p className="text-sm text-slate-500 mt-1">Candidate Dashboard & Analytics Hub</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {candidateProfile?.resume?.filename ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Resume: {candidateProfile.resume.filename}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                No Resume Uploaded
              </span>
            )}
            {candidateProfile?.skills?.length > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {candidateProfile.skills.length} Skills Profiled
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                No Skills Listed
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/profile"
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 text-xs cursor-pointer"
          >
            Edit Profile
          </Link>
          <Link
            to="/resume-upload"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 text-xs cursor-pointer"
          >
            Upload Resume
          </Link>
        </div>
      </div>

      {applyStatus.message && (
        <div
          className={`mb-6 p-4 border rounded text-sm ${
            applyStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {applyStatus.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg">
        <button
          onClick={() => setTab('jobs')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer ${
            tab === 'jobs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Available Jobs ({filteredJobs.length})
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer ${
            tab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Applications ({applications.length})
        </button>
      </div>

      {tab === 'jobs' && (
        <div>
          {/* Search bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <input
              type="text"
              placeholder="Search jobs by title, company, or description..."
              className="form-input w-full max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center p-8 bg-white border border-slate-200 rounded-lg text-slate-500 text-sm">
              No matching jobs found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const appDetails = getAppliedDetails(job._id);
                const score = getJobMatchScore(job.requiredSkills);

                const cardActions = appDetails ? (
                  <div className="w-full flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(appDetails.status)}`}>
                      Status: {appDetails.status}
                    </span>
                    {appDetails.matchScore !== undefined && (
                      <span className="text-xs font-semibold text-blue-600">
                        ATS Match: {appDetails.matchScore}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <button
                      onClick={() => handleApply(job._id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Apply Now
                    </button>
                    {score !== null && (
                      <span className="text-xs font-semibold text-slate-500">
                        Estimated Match: <span className="text-blue-600">{score}%</span>
                      </span>
                    )}
                  </div>
                );

                return (
                  <JobCard
                    key={job._id}
                    job={job}
                    actions={cardActions}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'applications' && (
        <DataTable
          headers={['Job Title', 'Company', 'Applied Date', 'ATS Score', 'Status']}
          emptyMessage="You haven't applied to any jobs yet."
        >
          {applications.map((app) => (
            <tr key={app._id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                {app.job?.title || 'Job Deleted'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                {app.job?.company || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                <span className="font-semibold text-blue-600">{app.matchScore}%</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
};

export default CandidateDashboard;
