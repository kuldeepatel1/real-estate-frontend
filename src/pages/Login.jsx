import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/slices/authSlice";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, token } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const hasRedirected = useRef(false);

  // Effect to redirect after login (when user and token are available)
  useEffect(() => {
    // Only redirect if we have both user and token and haven't redirected yet
    if (token && user && !hasRedirected.current) {
      const userRole = user.user_role || user.role;
      hasRedirected.current = true;
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          // For any non-admin role, go to the public home page
          navigate("/", { replace: true });
        }
      }, 100);
    }
  }, [user, token, navigate]);

  // Reset redirect flag when component unmounts or when user/logout
  useEffect(() => {
    return () => {
      hasRedirected.current = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const res = await dispatch(loginUser({ user_email: email, user_password: password }));
    if (res.meta && res.meta.requestStatus === "fulfilled") {
      // prime protected data after successful login
      dispatch(fetchFavorites());
      dispatch(fetchAppointments());
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {typeof error === "object" ? error.message || JSON.stringify(error) : error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-medium transition ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

