import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import DataEntry from "./pages/DataEntry";
import DeadStockAlerts from "./pages/DeadStockAlerts";
import LandingPage from "./pages/LandingPage";
import InventoryPage from "./pages/InventoryPage";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

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
          path="/inventory"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <InventoryPage />
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
      </Routes>
    </Router>
  );
}

export default App;
