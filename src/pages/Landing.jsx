import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isAuthenticated = !!user || !!localStorage.getItem("token");

  if (isAuthenticated) {
    const userRole = localStorage.getItem("userRole");
    const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
    navigate(redirectPath, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-200 to-white text-gray-900">
      <div className="relative flex flex-col items-center justify-center text-center py-20 px-6">
        <motion.h1
          className="text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to <span className="block">TaskFlow</span>
        </motion.h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Boost productivity, streamline workflow, and collaborate in real-time.
        </p>
      </div>

      <div className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Dashboard Panel</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          {["user", "admin"].map((role) => (
            <motion.div
              key={role}
              className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-2xl font-semibold capitalize text-gray-800">{role === "user" ? "Team Member" : "Administrator"}</h3>
              <p className="mt-3 text-gray-600">
                {role === "user"
                  ? "Create tasks, track progress, and collaborate with your team."
                  : "Manage users, verify tasks, and oversee team operations."}
              </p>
              <div className="mt-6 space-y-4">
                <button
                  onClick={() => navigate("/signup", { state: { role } })}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:opacity-90 transition"
                >
                  Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
                <button
                  onClick={() => navigate("/login", { state: { role } })}
                  className="w-full py-3 border border-gray-400 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-200 transition"
                >
                  Log In as {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="fixed bottom-10 right-10 bg-indigo-500 text-white p-3 rounded-full cursor-pointer"
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
      >
        ↑
      </motion.div>
    </div>
  );
};

export default Landing;
