import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("superadmin@cinesphere.com");
  const [password, setPassword] = useState("superadmin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, "superadmin");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login("superadmin@cinesphere.com", "superadmin123", "superadmin");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back to Roles
        </button>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Administrator Login
          </h1>
          <p className="text-slate-400 mb-8">
            Platform administration & theatre approvals
          </p>

          {/* Warning */}
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle
              className="text-red-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-red-300 text-sm font-semibold">
                Restricted Access
              </p>
              <p className="text-red-200 text-xs mt-1">
                This interface is restricted to platform administrators only.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="admin@cinesphere.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-lg transition"
          >
            Use Demo Account
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
            <p className="text-red-300 text-sm font-semibold mb-2">
              Demo Credentials:
            </p>
            <p className="text-red-200 text-xs">
              Email: superadmin@cinesphere.com
            </p>
            <p className="text-red-200 text-xs">Password: superadmin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
