import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {
  MainLayout,
  LoginPage,
  ProtectedRoute,
  Dashboard,
  UploadResume,
  AIReview,
  AllResumes,
  ResumeDetail,
  VersionHistory,
  ResumeBuilder
} from './components';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/ai-review" element={<AIReview />} />
            <Route path="/resumes" element={<AllResumes />} />
            <Route path="/resume/:id" element={<ResumeDetail />} />
            <Route path="/versions" element={<VersionHistory />} />
            <Route path="/build-resume" element={<ResumeBuilder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;