import React from 'react';

const StatisticsCard = ({ title, value, subtext, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600 border-blue-200 bg-blue-50/50',
    green: 'text-emerald-600 border-emerald-200 bg-emerald-50/50',
    red: 'text-rose-600 border-rose-200 bg-rose-50/50',
    amber: 'text-amber-600 border-amber-200 bg-amber-50/50'
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="flex items-baseline mt-2">
        <span className="text-3xl font-semibold text-slate-900">{value}</span>
        {subtext && (
          <span className="ml-2 text-xs text-slate-400 font-normal">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatisticsCard;
