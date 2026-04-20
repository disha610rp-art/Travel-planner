import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import useAuth from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Lazy-loaded pages for code splitting (React.lazy + Suspense)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewTripPage = lazy(() => import('./pages/NewTripPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Suspense fallback with pastel loading dots */
const SuspenseFallback = () => (
  <div className="suspense-fallback">
    <div className="suspense-loader">
      <div className="suspense-dots">
        <div className="suspense-dot"></div>
        <div className="suspense-dot"></div>
        <div className="suspense-dot"></div>
      </div>
      <span className="suspense-text">Loading...</span>
    </div>
  </div>
);

/**
 * AppContent — Contains routes and layout, needs auth context to determine TripProvider userId
 */
const AppContent = () => {
  const { user } = useAuth();

  return (
    <TripProvider userId={user?.id || null}>
      <div className="app">
        <Navbar />
        <div className="app-content">
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/trip/new" element={
                <ProtectedRoute><NewTripPage /></ProtectedRoute>
              } />
              <Route path="/trip/:id" element={
                <ProtectedRoute><TripDetailPage /></ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </TripProvider>
  );
};

/**
 * App — Root component wrapping everything in AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
