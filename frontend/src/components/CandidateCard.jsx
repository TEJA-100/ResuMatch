import React from 'react';

const CandidateCard = ({ candidate, actions }) => {
  const { user, phone, bio, skills = [], resume } = candidate;
  const name = user?.name || 'Unknown Candidate';
  const email = user?.email || '';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{email} {phone ? `• ${phone}` : ''}</p>
        </div>
        {resume?.filename ? (
          <a
            href={`http://localhost:5000/uploads/${resume.filepath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-medium border border-blue-200 bg-blue-50 px-2.5 py-1 rounded"
          >
            Download Resume
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">No resume uploaded</span>
        )}
      </div>

      {bio && (
        <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {bio}
        </p>
      )}

      {skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Candidate Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {actions && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2 justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
