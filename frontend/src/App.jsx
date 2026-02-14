import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import DeadStockAlerts from './pages/DeadStockAlerts';
import { useState, useEffect } from 'react';

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-white">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
        </div>
    </div>
);

// Protected route for authenticated users
const ProtectedRoute = ({ isAuthenticated, isLoading, children }) => {
    if (isLoading) {
        return <LoadingSpinner />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Public route (redirects to dashboard if already authenticated)
const PublicRoute = ({ isAuthenticated, isLoading, children }) => {
    if (isLoading) {
        return <LoadingSpinner />;
    }
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={<Register setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-entry"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DataEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dead-stock-alerts"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DeadStockAlerts />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
