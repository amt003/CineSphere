import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("customer1@cinesphere.com");
  const [password, setPassword] = useState("customer123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, "customer");
      navigate("/");
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
      await login("customer1@cinesphere.com", "customer123", "customer");
      navigate("/");
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
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back to Roles
        </button>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">Customer Login</h1>
          <p className="text-slate-400 mb-8">Book your movie tickets now</p>

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
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="your@email.com"
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
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
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
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-center">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register-customer")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded-lg p-4">
            <p className="text-cyan-300 text-sm font-semibold mb-2">
              Demo Credentials:
            </p>
            <p className="text-cyan-200 text-xs">
              Email: customer1@cinesphere.com
            </p>
            <p className="text-cyan-200 text-xs">Password: customer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
