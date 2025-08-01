/**
 * Login Component
 * 
 * A comprehensive authentication component that handles user login with proper
 * validation, error handling, and state management. Implements localStorage-based
 * authentication for persistent user sessions across browser refreshes.
 * 
 * Features:
 * - Supports both default and custom user accounts
 * - Persists authentication state across browser sessions
 * - Provides clear error feedback and loading states
 * - Implements role-based redirection
 * - Logs authentication events for admin tracking
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { FaLock, FaEnvelope, FaExclamationCircle, FaSpinner } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const role = location.state?.role || "user";
  const from = location.state?.from || "/";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        addNotification("Logged in successfully!", "success");
      const userRole = localStorage.getItem("userRole");
      navigate(userRole === "admin" ? "/admin/dashboard" : "/user/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await login(email, password, role);
      
      const userRole = localStorage.getItem("userRole");
      navigate(from !== "/" ? from : (userRole === "admin" ? "/admin/dashboard" : "/user/dashboard"));
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md transform transition duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {role === "admin" ? "Admin Login" : "User Login"}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded animate-pulse" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-500 mr-2" aria-hidden="true" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                className="w-full pl-10 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email Address"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                type="password"
                className="w-full pl-10 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-md shadow-md transition duration-200 text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
            }`}
            disabled={loading}
            aria-label="Login Button"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <div>
            <span
              className="text-blue-600 text-sm hover:underline cursor-pointer"
              onClick={() => navigate("/forgot-password", { state: { role } })}
            >
              Forgot Password?
            </span>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <Link
              to="/signup"
              state={{ role }}
              className="text-blue-600 text-sm hover:underline"
            >
              Sign up
            </Link>
          </div>
          <div>
            <Link
              to="/"
              className="text-gray-500 text-sm hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
