import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import DataTable from '../components/DataTable';

const AtsMatchingPage = () => {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/applications/job/${jobId}/match`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load matching report');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-600">
        Loading ATS match report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded text-center">
          {error || 'No match data found.'}
        </div>
        <div className="text-center mt-4">
          <Link to="/job-management" className="text-blue-600 hover:underline">
            Back to Job Postings
          </Link>
        </div>
      </div>
    );
  }

  const { job, rankings = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ATS Resume Match Report</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed alignment metrics and ranking for job postings.</p>
        </div>
        <Link
          to="/job-management"
          className="px-3 py-1.5 border border-slate-300 text-slate-700 bg-white rounded hover:bg-slate-50 text-xs font-semibold"
        >
          Back to Jobs
        </Link>
      </div>

      {/* Job Details Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
            <p className="text-sm font-semibold text-slate-500">{job.company}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                {job.location}
              </span>
              {job.employmentType && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  {job.employmentType}
                </span>
              )}
              {job.experience && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  {job.experience}
                </span>
              )}
              {job.salaryRange && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {job.salaryRange}
                </span>
              )}
              {job.applicationDeadline && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Job Description Summary
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100">
              {job.description}
            </p>
          </div>

          {job.responsibilities && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Core Responsibilities
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100">
                {job.responsibilities}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {job.requiredQualifications && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Required Qualifications
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100">
                {job.requiredQualifications}
              </p>
            </div>
          )}

          {job.preferredQualifications && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Preferred Qualifications
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100">
                {job.preferredQualifications}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Job Skills ({job.requiredSkills?.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.hiringName && (
          <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200/60 max-w-md flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hiring Manager</div>
              <div className="text-sm font-semibold text-slate-700">{job.hiringName}</div>
              <a href={`mailto:${job.hiringEmail}`} className="text-xs text-blue-600 hover:underline">{job.hiringEmail}</a>
            </div>
            {job.hiringLinkedin && (
              <a
                href={job.hiringLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                LinkedIn Profile
              </a>
            )}
          </div>
        )}
      </div>

      {/* Rankings Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">
            Candidate Ranking Table ({rankings.length} Applicants)
          </h2>
          <span className="text-xs text-slate-400">
            Ranked by match percentage score descending
          </span>
        </div>

        <DataTable
          headers={['Rank', 'Candidate details', 'Match %', 'Matching Skills', 'Missing Skills', 'Status', 'Action']}
          emptyMessage="No candidates have applied to this job yet."
        >
          {rankings.map((cand) => (
            <tr key={cand.applicationId}>
              <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                #{cand.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                {cand.name}
                <div className="text-xs text-slate-400">{cand.email}</div>
                {cand.phone && <div className="text-xs text-slate-400">{cand.phone}</div>}
                {(cand.linkedin || cand.gmail || cand.website || cand.github) && (
                  <div className="flex gap-1.5 mt-1 text-[10px] items-center">
                    {cand.linkedin && (
                      <a href={cand.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">LinkedIn</a>
                    )}
                    {cand.linkedin && (cand.gmail || cand.website || cand.github) && <span className="text-slate-300">•</span>}
                    {cand.gmail && (
                      <a href={`mailto:${cand.gmail}`} className="text-rose-600 hover:underline font-semibold">Gmail</a>
                    )}
                    {cand.gmail && (cand.website || cand.github) && <span className="text-slate-300">•</span>}
                    {cand.website && (
                      <a href={cand.website} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:underline font-semibold">Website</a>
                    )}
                    {cand.website && cand.github && <span className="text-slate-300">•</span>}
                    {cand.github && (
                      <a href={cand.github} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline font-semibold">GitHub</a>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-base font-bold ${
                    cand.matchScore >= 70
                      ? 'text-emerald-600'
                      : cand.matchScore >= 45
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {cand.matchScore}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-normal max-w-xs">
                {cand.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {cand.matchedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-normal max-w-xs">
                {cand.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {cand.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold italic">Complete Match!</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                    cand.status === 'Applied'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : cand.status === 'Shortlisted'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : cand.status === 'Interview Scheduled'
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : cand.status === 'Rejected'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-teal-50 border-teal-200 text-teal-700'
                  }`}
                >
                  {cand.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                <Link
                  to={`/applications/${cand.applicationId}/track`}
                  className="text-blue-600 hover:text-blue-900 border border-slate-200 bg-white px-2.5 py-1.5 rounded"
                >
                  Track Status
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default AtsMatchingPage;
