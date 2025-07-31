/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Implements JWT-based authentication with secure storage and proper state management.
 * 
 * Features:
 * - User authentication state management
 * - Login/logout functionality
 * - Token persistence
 * - Role-based access control support
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    return token && email ? { email } : null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (token) {
          const email = localStorage.getItem("email");
          
          if (email) {
            setUser({ email });
          } else {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await apiLogin({ email, password, role });
      
      if (!response.token) {
        throw new Error(response.message || 'Login failed');
      }
      
      localStorage.setItem("token", response.token);
      localStorage.setItem("email", email);
      localStorage.setItem("userRole", response.role);
      
      setUser({ email });
      return { email };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (fullName, email, password, role) => {
    try {
      const response = await apiRegister({ fullName, email, password, role });
      
      if (response.error) {
        throw new Error(response.message || response.error);
      }
      
      localStorage.setItem("token", response.token);
      localStorage.setItem("email", email);
      localStorage.setItem("userRole", role);
      
      setUser({ email });
      return { email };
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await apiLogout(token);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      
      setUser(null);
      
      console.log("User logged out");
    }
  };

  const resetPassword = async (email) => {
    console.log("Password reset requested for:", email);
    return Promise.resolve();
  };

  const hasRole = (requiredRole) => {
    const userRole = localStorage.getItem("userRole");
    return userRole === requiredRole;
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout: handleLogout,
    resetPassword,
    hasRole,
    isAdmin: () => hasRole("admin"),
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
