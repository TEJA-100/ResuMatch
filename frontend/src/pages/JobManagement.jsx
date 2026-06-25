import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DataTable from '../components/DataTable';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [status, setStatus] = useState('open');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [preferredQualifications, setPreferredQualifications] = useState('');
  const [requiredQualifications, setRequiredQualifications] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [hiringName, setHiringName] = useState('');
  const [hiringEmail, setHiringEmail] = useState('');
  const [hiringLinkedin, setHiringLinkedin] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs?myJobs=true');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to load my jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleEditClick = (job) => {
    setEditMode(true);
    setSelectedJobId(job._id);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location || '');
    setExperience(job.experience || '');
    setEmploymentType(job.employmentType || 'Full-Time');
    setDescription(job.description);
    setRequiredSkills(job.requiredSkills.join(', '));
    setStatus(job.status);
    setApplicationDeadline(job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '');
    setSalaryRange(job.salaryRange || '');
    setPreferredQualifications(job.preferredQualifications || '');
    setRequiredQualifications(job.requiredQualifications || '');
    setResponsibilities(job.responsibilities || '');
    setHiringName(job.hiringName || '');
    setHiringEmail(job.hiringEmail || '');
    setHiringLinkedin(job.hiringLinkedin || '');
    setFormError('');
    setFormSuccess('');
  };

  const handleResetForm = () => {
    setEditMode(false);
    setSelectedJobId(null);
    setTitle('');
    setCompany('');
    setLocation('');
    setExperience('');
    setEmploymentType('Full-Time');
    setDescription('');
    setRequiredSkills('');
    setStatus('open');
    setApplicationDeadline('');
    setSalaryRange('');
    setPreferredQualifications('');
    setRequiredQualifications('');
    setResponsibilities('');
    setHiringName('');
    setHiringEmail('');
    setHiringLinkedin('');
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (
      !title || !company || !location || !experience || !employmentType || 
      !description || !requiredSkills || !applicationDeadline || !salaryRange || 
      !preferredQualifications || !requiredQualifications || !responsibilities || 
      !hiringName || !hiringEmail || !hiringLinkedin
    ) {
      setFormError('Please fill in all fields');
      return;
    }

    const payload = {
      title,
      company,
      location,
      experience,
      employmentType,
      description,
      requiredSkills,
      applicationDeadline,
      salaryRange,
      preferredQualifications,
      requiredQualifications,
      responsibilities,
      hiringName,
      hiringEmail,
      hiringLinkedin,
      status
    };

    try {
      if (editMode) {
        await API.put(`/jobs/${selectedJobId}`, payload);
        setFormSuccess('Job updated successfully!');
      } else {
        await API.post('/jobs', payload);
        setFormSuccess('Job created successfully!');
      }
      handleResetForm();
      await loadJobs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? All applications will be deleted too.')) {
      return;
    }
    
    setFormError('');
    setFormSuccess('');

    try {
      await API.delete(`/jobs/${jobId}`);
      setFormSuccess('Job deleted successfully!');
      await loadJobs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Job Posting Management</h1>
      <p className="text-sm text-slate-500 mt-1">Create and manage your active job listings.</p>

      {formSuccess && (
        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded">
          {formSuccess}
        </div>
      )}

      {formError && (
        <div className="mt-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Job Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            {editMode ? 'Edit Job Posting' : 'Create New Job'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend React Developer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. ResuMatch Inc."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Location *
              </label>
              <select
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">Select Location</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Experience *
              </label>
              <input
                type="text"
                className="form-input"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 0-2 Years"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Employment Type *
              </label>
              <select
                className="form-input"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                required
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Intern">Intern</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Salary Range *
              </label>
              <input
                type="text"
                className="form-input"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. $80,000 - $100,000 / year"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                className="form-input"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Required Skills * (Comma-separated)
              </label>
              <input
                type="text"
                className="form-input"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Express, MongoDB"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                These exact terms will be used by the ATS match algorithm.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Job Description *
              </label>
              <textarea
                className="form-input min-h-24 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe job role..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Responsibilities *
              </label>
              <textarea
                className="form-input min-h-24 resize-y"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="List core responsibilities of the role..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Required Qualifications *
              </label>
              <textarea
                className="form-input min-h-24 resize-y"
                value={requiredQualifications}
                onChange={(e) => setRequiredQualifications(e.target.value)}
                placeholder="List minimum education/experience/certification requirements..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Preferred Qualifications *
              </label>
              <textarea
                className="form-input min-h-24 resize-y"
                value={preferredQualifications}
                onChange={(e) => setPreferredQualifications(e.target.value)}
                placeholder="List nice-to-have qualifications..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Hiring Manager Name *
              </label>
              <input
                type="text"
                className="form-input"
                value={hiringName}
                onChange={(e) => setHiringName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Hiring Manager Email *
              </label>
              <input
                type="email"
                className="form-input"
                value={hiringEmail}
                onChange={(e) => setHiringEmail(e.target.value)}
                placeholder="e.g. jane.doe@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Hiring Manager LinkedIn URL *
              </label>
              <input
                type="url"
                className="form-input"
                value={hiringLinkedin}
                onChange={(e) => setHiringLinkedin(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/janedoe"
                required
              />
            </div>

            {editMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm cursor-pointer"
              >
                {editMode ? 'Update' : 'Post Job'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Jobs List */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-slate-500 text-center py-6">Loading listings...</p>
          ) : (
            <DataTable
              headers={['Job details', 'Skills', 'Status', 'Actions']}
              emptyMessage="You haven't posted any jobs yet."
            >
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="font-semibold text-slate-900">{job.title}</div>
                    <div className="text-xs text-slate-500">
                      {job.company} • {job.location} • {job.employmentType || 'Full-Time'} • {job.experience || 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Salary: <span className="text-slate-600 font-medium">{job.salaryRange}</span> • 
                      Deadline: <span className="text-slate-600 font-medium">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Hiring Manager: <span className="text-slate-600 font-medium">{job.hiringName}</span> (<a href={job.hiringLinkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        job.status === 'open'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium space-y-2 lg:space-y-0 lg:space-x-2 flex flex-col lg:flex-row">
                    <Link
                      to={`/jobs/${job._id}/match`}
                      className="text-blue-600 hover:text-blue-900 border border-blue-200 bg-blue-50 px-2 py-1 rounded text-center"
                    >
                      ATS Rankings
                    </Link>
                    <button
                      onClick={() => handleEditClick(job)}
                      className="text-slate-600 hover:text-slate-950 border border-slate-300 bg-white px-2 py-1 rounded cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="text-rose-600 hover:text-rose-900 border border-rose-200 bg-rose-50 px-2 py-1 rounded cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
