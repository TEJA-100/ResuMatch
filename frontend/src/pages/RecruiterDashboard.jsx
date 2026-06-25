import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import StatisticsCard from '../components/StatisticsCard';
import DataTable from '../components/DataTable';
import CandidateCard from '../components/CandidateCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';

const RecruiterDashboard = () => {
  const [tab, setTab] = useState('applications');
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlistedCandidates: 0,
    interviewsScheduled: 0,
    hired: 0,
    rejected: 0
  });
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states for Candidates tab
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateSkills, setCandidateSkills] = useState([]);

  // Fetch all recruiter dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await API.get('/applications/stats');
      setStats(statsRes.data.data);

      // 2. Fetch Applications
      const appsRes = await API.get('/applications');
      setApplications(appsRes.data.data);

      // 3. Fetch Candidates
      const candRes = await API.get('/candidates');
      setCandidates(candRes.data.data);
    } catch (err) {
      console.error('Failed to load recruiter dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCandidateSearch = async () => {
    try {
      const skillsQuery = candidateSkills.join(',');
      const res = await API.get('/candidates', {
        params: {
          search: candidateSearch,
          skills: skillsQuery || undefined
        }
      });
      setCandidates(res.data.data);
    } catch (err) {
      console.error('Failed to filter candidates', err);
    }
  };

  useEffect(() => {
    if (tab === 'candidates') {
      handleCandidateSearch();
    }
  }, [candidateSkills, tab]);

  const getStatusColor = (status) => {
    const map = {
      'Applied': 'bg-blue-50 text-blue-700 border-blue-200',
      'Shortlisted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Interview Scheduled': 'bg-orange-50 text-orange-700 border-orange-200',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
      'Hired': 'bg-teal-50 text-teal-700 border-teal-200'
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-600">
        Loading recruiter dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
      <p className="text-sm text-slate-500 mt-1">Manage jobs, candidates, and resume matching scores.</p>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
        <StatisticsCard
          title="Total Jobs"
          value={stats.totalJobs}
          subtext="Active listings"
          color="blue"
        />
        <StatisticsCard
          title="Total Applicants"
          value={stats.totalApplicants}
          subtext="Total applications"
          color="amber"
        />
        <StatisticsCard
          title="Shortlisted"
          value={stats.shortlistedCandidates}
          subtext="Waiting for review"
          color="blue"
        />
        <StatisticsCard
          title="Hired Candidates"
          value={stats.hired}
          subtext="Successful offers"
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg">
        <button
          onClick={() => setTab('applications')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer ${
            tab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Recent Applications ({applications.length})
        </button>
        <button
          onClick={() => setTab('candidates')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer ${
            tab === 'candidates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Candidate Directory ({candidates.length})
        </button>
      </div>

      {tab === 'applications' && (
        <DataTable
          headers={['Candidate Name', 'Job Title', 'Applied Date', 'ATS Match Score', 'Status', 'Actions']}
          emptyMessage="No applications received yet."
        >
          {applications.map((app) => (
            <tr key={app._id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                {app.candidate?.user?.name || 'Unknown Candidate'}
                <div className="text-xs text-slate-400">{app.candidate?.user?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                {app.job?.title || 'Deleted Job'}
                <div className="text-xs text-slate-400">{app.job?.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-semibold ${app.matchScore >= 70 ? 'text-emerald-600' : app.matchScore >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {app.matchScore}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium space-x-2">
                <Link
                  to={`/jobs/${app.job?._id}/match`}
                  className="text-blue-600 hover:text-blue-900 border border-blue-200 bg-blue-50 px-2 py-1 rounded"
                >
                  ATS Match Details
                </Link>
                <Link
                  to={`/applications/${app._id}/track`}
                  className="text-slate-600 hover:text-slate-900 border border-slate-300 bg-white px-2 py-1 rounded"
                >
                  Update Status
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {tab === 'candidates' && (
        <div className="space-y-6">
          {/* Candidate Search Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Search Candidate Name
              </label>
              <SearchBar
                value={candidateSearch}
                onChange={setCandidateSearch}
                placeholder="Search candidates by name..."
                onSubmit={handleCandidateSearch}
              />
            </div>
            <div>
              <FilterPanel
                activeSkills={candidateSkills}
                onFilterChange={setCandidateSkills}
              />
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {candidates.length === 0 ? (
            <div className="text-center p-8 bg-white border border-slate-200 rounded-lg text-slate-500 text-sm">
              No candidates found matching the query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((cand) => (
                <CandidateCard
                  key={cand._id}
                  candidate={cand}
                  actions={
                    cand.resume?.filename && (
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${cand.resume.filepath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded"
                      >
                        View Resume PDF
                      </a>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
