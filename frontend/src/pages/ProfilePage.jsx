import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ResumeUpload from '../components/ResumeUpload';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  // Education item states
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [eduFrom, setEduFrom] = useState('');
  const [eduTo, setEduTo] = useState('');
  const [eduCurrent, setEduCurrent] = useState(false);
  const [eduError, setEduError] = useState('');

  // Experience item states
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [expFrom, setExpFrom] = useState('');
  const [expTo, setExpTo] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expError, setExpError] = useState('');

  const [generalSuccess, setGeneralSuccess] = useState('');
  const [generalError, setGeneralError] = useState('');

  const loadProfile = async () => {
    try {
      const res = await API.get('/candidates/me');
      const data = res.data.data;
      setProfile(data);
      setName(data.user?.name || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setSkills(data.skills ? data.skills.join(', ') : '');
    } catch (err) {
      console.error(err);
      setGeneralError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setGeneralSuccess('');
    setGeneralError('');

    try {
      const res = await API.put('/candidates/me', {
        name,
        phone,
        bio,
        skills
      });
      setGeneralSuccess('Basic profile information updated successfully!');
      setProfile(res.data.data);
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Failed to update basic profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    setEduError('');
    setGeneralSuccess('');

    if (!school || !degree || !eduFrom) {
      setEduError('School name, degree, and start date are required');
      return;
    }

    const newEdu = {
      school,
      degree,
      from: eduFrom,
      to: eduCurrent ? null : eduTo,
      current: eduCurrent
    };

    try {
      const updatedEducation = [...(profile.education || []), newEdu];
      const res = await API.put('/candidates/me', { education: updatedEducation });
      setProfile(res.data.data);
      setGeneralSuccess('Education entry added!');
      
      // Clear form
      setSchool('');
      setDegree('');
      setEduFrom('');
      setEduTo('');
      setEduCurrent(false);
    } catch (err) {
      setEduError(err.response?.data?.message || 'Failed to add education');
    }
  };

  const handleDeleteEducation = async (eduId) => {
    setGeneralSuccess('');
    try {
      const updatedEducation = profile.education.filter(e => e._id !== eduId);
      const res = await API.put('/candidates/me', { education: updatedEducation });
      setProfile(res.data.data);
      setGeneralSuccess('Education entry removed!');
    } catch (err) {
      setGeneralError('Failed to remove education entry');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    setExpError('');
    setGeneralSuccess('');

    if (!jobTitle || !company || !expFrom) {
      setExpError('Job title, company, and start date are required');
      return;
    }

    const newExp = {
      title: jobTitle,
      company,
      from: expFrom,
      to: expCurrent ? null : expTo,
      current: expCurrent
    };

    try {
      const updatedExperience = [...(profile.experience || []), newExp];
      const res = await API.put('/candidates/me', { experience: updatedExperience });
      setProfile(res.data.data);
      setGeneralSuccess('Experience entry added!');

      // Clear form
      setJobTitle('');
      setCompany('');
      setExpFrom('');
      setExpTo('');
      setExpCurrent(false);
    } catch (err) {
      setExpError(err.response?.data?.message || 'Failed to add experience');
    }
  };

  const handleDeleteExperience = async (expId) => {
    setGeneralSuccess('');
    try {
      const updatedExperience = profile.experience.filter(e => e._id !== expId);
      const res = await API.put('/candidates/me', { experience: updatedExperience });
      setProfile(res.data.data);
      setGeneralSuccess('Experience entry removed!');
    } catch (err) {
      setGeneralError('Failed to remove experience entry');
    }
  };

  const handleUploadComplete = (data) => {
    setGeneralSuccess('Resume processed! Extracted skills added to profile.');
    loadProfile();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-600">
        Loading profile information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Keep your professional history and parsed skills details updated.</p>
      </div>

      {generalSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded">
          {generalSuccess}
        </div>
      )}

      {generalError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Hand: Resume Upload Widget & basic info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Resume Management</h2>
            {profile?.resume?.filename ? (
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700">
                <span className="font-semibold block">Uploaded Resume:</span>
                <span className="break-all">{profile.resume.filename}</span>
                <span className="block text-slate-400 mt-1">
                  Uploaded: {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                </span>
                <a
                  href={`http://localhost:5000/uploads/${profile.resume.filepath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:underline font-semibold"
                >
                  Download File
                </a>
              </div>
            ) : (
              <div className="mb-4 text-xs text-slate-400 bg-slate-50 border border-slate-200 p-3 text-center rounded italic">
                No resume file uploaded yet.
              </div>
            )}
            <ResumeUpload onUploadSuccess={handleUploadComplete} />
          </div>
        </div>

        {/* Right Hand: Profile Details Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Basic Details & Skills */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Basic Information & Skills</h2>
            <form onSubmit={handleUpdateBasicInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input bg-slate-50 text-slate-400 cursor-not-allowed"
                    value={profile?.user?.email || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Short Professional Bio
                </label>
                <textarea
                  className="form-input min-h-16 resize-y"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters about yourself..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Professional Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, SQL"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Separate with commas. These will be matched against job requirements.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary cursor-pointer w-full"
              >
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Work Experience</h2>

            {/* List existing experience */}
            {profile?.experience?.length > 0 ? (
              <div className="divide-y divide-slate-100 mb-6">
                {profile.experience.map((exp) => (
                  <div key={exp._id} className="py-3 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                      <p className="text-xs text-slate-600">{exp.company}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(exp.from).toLocaleDateString()} –{' '}
                        {exp.current ? 'Present' : exp.to ? new Date(exp.to).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp._id)}
                      className="text-xs text-rose-600 hover:text-rose-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-6">No experience history added yet.</p>
            )}

            {/* Add Experience form */}
            <form onSubmit={handleAddExperience} className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Experience</h3>
              {expError && <p className="text-xs text-rose-600">{expError}</p>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Job Title *"
                    className="form-input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Company Name *"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-400 uppercase">From Date</label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={expFrom}
                      onChange={(e) => setExpFrom(e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-400 uppercase">To Date</label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={expTo}
                      onChange={(e) => setExpTo(e.target.value)}
                      disabled={expCurrent}
                    />
                  </div>
                </div>
                <div className="flex items-center h-full pt-4">
                  <input
                    type="checkbox"
                    id="expCurrent"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={expCurrent}
                    onChange={(e) => setExpCurrent(e.target.checked)}
                  />
                  <label htmlFor="expCurrent" className="ml-2 text-xs text-slate-600 font-medium">
                    I currently work here
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-secondary py-1.5 w-full text-xs cursor-pointer">
                Add Work Experience
              </button>
            </form>
          </div>

          {/* Education */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Education History</h2>

            {/* List existing education */}
            {profile?.education?.length > 0 ? (
              <div className="divide-y divide-slate-100 mb-6">
                {profile.education.map((edu) => (
                  <div key={edu._id} className="py-3 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{edu.school}</h4>
                      <p className="text-xs text-slate-600">{edu.degree}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(edu.from).toLocaleDateString()} –{' '}
                        {edu.current ? 'Present' : edu.to ? new Date(edu.to).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu._id)}
                      className="text-xs text-rose-600 hover:text-rose-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-6">No education history added yet.</p>
            )}

            {/* Add Education form */}
            <form onSubmit={handleAddEducation} className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Education</h3>
              {eduError && <p className="text-xs text-rose-600">{eduError}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="School / University *"
                    className="form-input"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Degree / Certificate *"
                    className="form-input"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-400 uppercase">From Date</label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={eduFrom}
                      onChange={(e) => setEduFrom(e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-400 uppercase">To Date</label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={eduTo}
                      onChange={(e) => setEduTo(e.target.value)}
                      disabled={eduCurrent}
                    />
                  </div>
                </div>
                <div className="flex items-center h-full pt-4">
                  <input
                    type="checkbox"
                    id="eduCurrent"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={eduCurrent}
                    onChange={(e) => setEduCurrent(e.target.checked)}
                  />
                  <label htmlFor="eduCurrent" className="ml-2 text-xs text-slate-600 font-medium">
                    I currently study here
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-secondary py-1.5 w-full text-xs cursor-pointer">
                Add Education Entry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
