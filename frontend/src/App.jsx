import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Guards
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import FinancialProfilePage from './pages/FinancialProfilePage';
import InvestmentRecommendationPage from './pages/InvestmentRecommendationPage';
import RecommendationHistoryPage from './pages/RecommendationHistoryPage';
import SecurityCenter from './pages/SecurityCenter';
import NotificationsPage from './pages/NotificationsPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import SecurityEventDetailsPage from './pages/SecurityEventDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected User Routes wrapped in AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<FinancialProfilePage />} />
              <Route path="/recommend" element={<InvestmentRecommendationPage />} />
              <Route path="/history" element={<RecommendationHistoryPage />} />
              <Route path="/security" element={<SecurityCenter />} />
              <Route path="/security/events/:id" element={<SecurityEventDetailsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<UserSettingsPage />} />

              {/* Admin-Only Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <SecurityEventDetailsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Route */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
  );
}
 