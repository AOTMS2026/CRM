import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthPage from './Auth';
import DashboardPage from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage defaultMode="signin" />} />
        <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

        {/* Enterprise CRM Dashboard with Dedicated Multi-Module Navbar */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}