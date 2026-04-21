import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      alert("Login successful! Redirecting...");
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-700/50 border border-gray-600 rounded-xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to your CineSphere account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    className="w-full bg-slate-800 text-white rounded-lg py-3 pl-10 pr-4 border border-gray-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-800 text-white rounded-lg py-3 pl-10 pr-10 border border-gray-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition mt-6"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-gray-400 text-sm mt-6">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Create One
                </a>
              </p>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 bg-slate-600/30 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-xs font-semibold mb-2">
                Demo Credentials:
              </p>
              <p className="text-gray-300 text-xs">
                Email: <span className="text-cyan-400">demo@example.com</span>
              </p>
              <p className="text-gray-300 text-xs">
                Password: <span className="text-cyan-400">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
