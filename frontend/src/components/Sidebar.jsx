import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Navigation Menu
        </h2>
        <nav className="mt-4 space-y-1">
          {role === 'recruiter' ? (
            <>
              <NavLink
                to="/recruiter-dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                Dashboard Stats
              </NavLink>
              <NavLink
                to="/job-management"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                Job Postings
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/candidate-dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                My Dashboard
              </NavLink>
              <NavLink
                to="/resume-ats-checker"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                ATS Score Checker
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                My Profile
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
