import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('candidate'); // 'candidate' or 'recruiter'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerCandidate, registerRecruiter } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (role === 'candidate') {
        await registerCandidate(name, email, password, phone);
        navigate('/candidate-dashboard');
      } else {
        await registerRecruiter(name, email, password);
        navigate('/recruiter-dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Create a ResuMatch Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-lg">
          <button
            type="button"
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 cursor-pointer ${
              role === 'candidate'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setRole('candidate');
              setLocalError('');
            }}
          >
            Candidate Sign Up
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 cursor-pointer ${
              role === 'recruiter'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setRole('recruiter');
              setLocalError('');
            }}
          >
            Recruiter Sign Up
          </button>
        </div>

        <div className="bg-white py-8 px-4 border border-t-0 border-slate-200 rounded-b-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {role === 'candidate' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password (min 6 characters)
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {localError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {localError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-none text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
