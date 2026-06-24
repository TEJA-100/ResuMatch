import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [candidateId, setCandidateId] = useState(localStorage.getItem('candidateId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data.user);
        if (res.data.candidateId) {
          setCandidateId(res.data.candidateId);
          localStorage.setItem('candidateId', res.data.candidateId);
        }
      } catch (err) {
        console.error('Failed to load user info', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: userToken, user: userData, candidateId: candId } = res.data;
      
      localStorage.setItem('token', userToken);
      if (candId) {
        localStorage.setItem('candidateId', candId);
        setCandidateId(candId);
      } else {
        localStorage.removeItem('candidateId');
        setCandidateId(null);
      }
      
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const registerCandidate = async (name, email, password, phone) => {
    setError(null);
    try {
      const res = await API.post('/auth/register/candidate', { name, email, password, phone });
      const { token: userToken, user: userData, candidateId: candId } = res.data;
      
      localStorage.setItem('token', userToken);
      if (candId) {
        localStorage.setItem('candidateId', candId);
        setCandidateId(candId);
      }
      
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const registerRecruiter = async (name, email, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/register/recruiter', { name, email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      localStorage.removeItem('candidateId');
      
      setToken(userToken);
      setCandidateId(null);
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('candidateId');
    setToken(null);
    setCandidateId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        candidateId,
        loading,
        error,
        login,
        registerCandidate,
        registerRecruiter,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
