import React from 'react';

const JobCard = ({ job, actions, showFullDescription = false }) => {
  const { title, company, location, experience, employmentType, description, requiredSkills = [] } = job;

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength || showFullDescription) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-500">{company}</p>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
              {employmentType && <span className="font-semibold text-slate-500">{employmentType}</span>}
              {employmentType && experience && <span>•</span>}
              {experience && <span>{experience}</span>}
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            {location}
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {truncateText(description)}
        </p>

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
      </div>

      {actions && <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">{actions}</div>}
    </div>
  );
};

export default JobCard;
