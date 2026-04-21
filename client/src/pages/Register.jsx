import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]91[-]?[6-9][0-9]{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid Indian phone number (format: +91XXXXXXXXXX)";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      alert("Registration successful! Redirecting to login...");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-700/50 border border-gray-600 rounded-xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Join CineSphere today
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-800 text-white rounded-lg py-3 pl-10 pr-4 border border-gray-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

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

              {/* Phone Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-800 text-white rounded-lg py-3 pl-10 pr-4 border border-gray-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-800 text-white rounded-lg py-3 pl-10 pr-10 border border-gray-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition mt-6"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              {/* Already have account link */}
              <p className="text-center text-gray-400 text-sm mt-6">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Sign In
                </a>
              </p>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
