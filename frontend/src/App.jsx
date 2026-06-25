import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobManagement from './pages/JobManagement';
import ResumeUploadPage from './pages/ResumeUploadPage';
import AtsMatchingPage from './pages/AtsMatchingPage';
import ApplicantTrackingPage from './pages/ApplicantTrackingPage';
import ProfilePage from './pages/ProfilePage';
import ResumeAtsChecker from './pages/ResumeAtsChecker';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">
        Verifying session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};


const DashboardLayout = ({ children, role }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 min-w-0 bg-slate-50">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

const StandardLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 bg-slate-50">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StandardLayout><LandingPage /></StandardLayout>} />
          <Route path="/login" element={<StandardLayout><Login /></StandardLayout>} />
          <Route path="/register" element={<StandardLayout><Register /></StandardLayout>} />

          {/* Candidate Protected Routes */}
          <Route
            path="/candidate-dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardLayout role="candidate">
                  <CandidateDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-upload"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <StandardLayout>
                  <ResumeUploadPage />
                </StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-ats-checker"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardLayout role="candidate">
                  <ResumeAtsChecker />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardLayout role="candidate">
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <DashboardLayout role="recruiter">
                  <RecruiterDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-management"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <DashboardLayout role="recruiter">
                  <JobManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/match"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <StandardLayout>
                  <AtsMatchingPage />
                </StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:applicationId/track"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <StandardLayout>
                  <ApplicantTrackingPage />
                </StandardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
