import React, { useState } from 'react';

const FilterPanel = ({ onFilterChange, activeSkills = [] }) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !activeSkills.includes(cleanSkill)) {
      const updated = [...activeSkills, cleanSkill];
      onFilterChange(updated);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = activeSkills.filter(s => s !== skillToRemove);
    onFilterChange(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Filter Candidates by Skills
      </h3>
      
      <form onSubmit={handleAddSkill} className="flex gap-2">
        <input
          type="text"
          className="form-input flex-1"
          placeholder="e.g. React, Node, Python..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-xs font-medium cursor-pointer"
        >
          Add Filter
        </button>
      </form>

      {activeSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activeSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 text-blue-500 hover:text-blue-900 font-bold focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onFilterChange([])}
            className="text-xs text-rose-600 hover:underline ml-auto font-medium"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
