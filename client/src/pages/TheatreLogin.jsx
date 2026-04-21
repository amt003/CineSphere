import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TheatreLogin = () => {
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
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
        "http://localhost:5000/api/auth/theatre/login",
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
      const userData = { ...data.user, role: "theatreAdmin" };
      setAuthUser(userData, data.accessToken);

      // Navigation will happen via the useEffect watching isAuthenticated
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-500/20 p-3 rounded-full">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Theatre Admin Portal
          </h1>
          <p className="text-gray-400">Manage Your Cinema on CineSphere</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                  placeholder="your@theatre.com"
                  required
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
                  className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition disabled:opacity-50 mt-8"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              Don't have an account yet?
            </p>
            <Link
              to="/admin/register"
              className="inline-block w-full bg-slate-700 text-amber-400 font-semibold py-3 rounded-lg border border-slate-600 hover:border-amber-400 hover:text-amber-300 transition"
            >
              Register Your Theatre
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <Link
            to="/"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Back to Customer Portal
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default TheatreLogin;
