import React from 'react';

const JobCard = ({ job, actions, showFullDescription = false }) => {
  const { 
    title, 
    company, 
    location, 
    experience, 
    employmentType, 
    description, 
    requiredSkills = [],
    applicationDeadline,
    salaryRange,
    preferredQualifications,
    requiredQualifications,
    responsibilities,
    hiringName,
    hiringEmail,
    hiringLinkedin
  } = job;

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength || showFullDescription) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-500">{company}</p>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400 items-center">
              {employmentType && <span className="font-semibold text-slate-500">{employmentType}</span>}
              {employmentType && experience && <span>•</span>}
              {experience && <span>{experience}</span>}
              {salaryRange && <span>•</span>}
              {salaryRange && <span className="text-emerald-600 font-semibold">{salaryRange}</span>}
            </div>
            {applicationDeadline && (
              <div className="text-[10px] text-rose-600 font-semibold mt-1 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 inline-block">
                Deadline: {new Date(applicationDeadline).toLocaleDateString()}
              </div>
            )}
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            {location}
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {truncateText(description)}
        </p>

        {/* Core sections */}
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          {responsibilities && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Responsibilities
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {showFullDescription ? responsibilities : truncateText(responsibilities, 100)}
              </p>
            </div>
          )}

          {requiredQualifications && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Required Qualifications
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {showFullDescription ? requiredQualifications : truncateText(requiredQualifications, 100)}
              </p>
            </div>
          )}

          {preferredQualifications && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Preferred Qualifications
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {showFullDescription ? preferredQualifications : truncateText(preferredQualifications, 100)}
              </p>
            </div>
          )}
        </div>

        {requiredSkills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-1">
              {requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hiring Manager info */}
        {hiringName && (
          <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200/60 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hiring Manager</div>
              <div className="text-xs font-semibold text-slate-700">{hiringName}</div>
              <a href={`mailto:${hiringEmail}`} className="text-[10px] text-blue-600 hover:underline block">{hiringEmail}</a>
            </div>
            {hiringLinkedin && (
              <a
                href={hiringLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-semibold hover:bg-blue-100 transition-colors"
              >
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {actions && <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">{actions}</div>}
    </div>
  );
};

export default JobCard;
