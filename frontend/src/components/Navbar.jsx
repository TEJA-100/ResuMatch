import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 tracking-tight">ResuMatch</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded">ATS</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={user.role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard'}
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm"
                >
                  Dashboard
                </Link>
                {user.role === 'recruiter' ? (
                  <Link
                    to="/job-management"
                    className="text-slate-600 hover:text-blue-600 font-medium text-sm"
                  >
                    Jobs
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="text-slate-600 hover:text-blue-600 font-medium text-sm"
                  >
                    Profile
                  </Link>
                )}
                <span className="text-slate-300 text-sm">|</span>
                <span className="text-slate-600 font-medium text-sm">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium text-xs cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-xs cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
