import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "customer",
      });
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
          onClick={() => navigate("/login-customer")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 mb-8">Join CineSphere to book tickets</p>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="+91XXXXXXXXXX"
                  required
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Format: +91XXXXXXXXXX (10 digits after +91)
              </p>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-slate-500"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-center">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login-customer")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
