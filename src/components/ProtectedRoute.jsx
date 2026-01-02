import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, isInitialized } = useSelector((state) => state.auth);

  // Debug logging
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("debug=auth")) {
      console.log("ProtectedRoute state:", { user, token, isInitialized, requiredRole });
    }
  }, [user, token, isInitialized, requiredRole]);

  // Wait for auth to be initialized before making any redirect decisions
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role - support both user_role (database) and role (normalized)
  const userRole = user.user_role || user.role;

  // Role mismatch
  if (requiredRole && userRole !== requiredRole) {
    // If admin page is accessed by regular user, redirect to user dashboard
    if (requiredRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    // If user page is accessed by admin, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

