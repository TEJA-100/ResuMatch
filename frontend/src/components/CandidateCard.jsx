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
          {(candidate.linkedin || candidate.gmail || candidate.website || candidate.github) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 border border-blue-200 bg-blue-50/50 text-blue-700 rounded text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {candidate.gmail && (
                <a
                  href={`mailto:${candidate.gmail}`}
                  className="px-2 py-0.5 border border-rose-200 bg-rose-50/50 text-rose-700 rounded text-[10px] font-semibold hover:bg-rose-100 transition-colors"
                >
                  Gmail
                </a>
              )}
              {candidate.website && (
                <a
                  href={candidate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 border border-slate-200 bg-slate-50/50 text-slate-700 rounded text-[10px] font-semibold hover:bg-slate-100 transition-colors"
                >
                  Website
                </a>
              )}
              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 border border-slate-300 bg-slate-100 text-slate-800 rounded text-[10px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
        {resume?.filename ? (
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${resume.filepath}`}
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
