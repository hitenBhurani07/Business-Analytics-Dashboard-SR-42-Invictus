import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import DeadStockAlerts from './pages/DeadStockAlerts';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
