import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/superadmin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/superadmin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Update AuthContext with user data and token
      const userData = { ...data.user, role: "superadmin" };
      setAuthUser(userData, data.accessToken);

      // Navigation will happen via the useEffect watching isAuthenticated
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Minimal, secure-looking login card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
          {/* Simple header */}
          <h1 className="text-center text-white font-semibold mb-8 text-lg">
            Administration
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-gray-400 focus:outline-none transition"
                  placeholder=""
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-gray-400 focus:outline-none transition"
                  placeholder=""
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-700 text-gray-200 font-semibold py-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 mt-8 border border-slate-600 hover:border-slate-500"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Minimal footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Unauthorized access is prohibited</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
