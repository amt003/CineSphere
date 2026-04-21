import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and role
 * Redirects to appropriate login portal based on required role
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login based on required role
  if (!isAuthenticated) {
    if (role === "theatreAdmin") {
      return <Navigate to="/admin/login" replace />;
    }
    if (role === "superadmin") {
      return <Navigate to="/superadmin/login" replace />;
    }
    // Default to customer login
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect based on their actual role
  if (role && userRole !== role) {
    if (userRole === "theatreAdmin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "superadmin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    // Customer
    return <Navigate to="/browse" replace />;
  }

  return children;
};

export default ProtectedRoute;
