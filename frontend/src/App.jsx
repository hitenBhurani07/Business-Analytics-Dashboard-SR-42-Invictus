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
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate auth check delay for smooth loading
        const timer = setTimeout(() => {
            const token = localStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                {/* Landing Page - Only visible to unauthenticated users */}
                <Route
                    path="/"
                    element={
                        isLoading ? (
                            <LoadingSpinner />
                        ) : isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <LandingPage />
                        )
                    }
                />

                {/* Public Routes - Signup & Login */}
                <Route
                    path="/register"
                    element={
                        <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <Register setIsAuthenticated={setIsAuthenticated} />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <Login setIsAuthenticated={setIsAuthenticated} />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes - Dashboard & Features */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <Dashboard onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/data-entry"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <DataEntry />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dead-stock-alerts"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <DeadStockAlerts />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect to appropriate page */}
                <Route
                    path="*"
                    element={
                        isLoading ? (
                            <LoadingSpinner />
                        ) : isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;