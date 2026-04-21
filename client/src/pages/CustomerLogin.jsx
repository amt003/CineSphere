import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
  const [error, setError] = useState("");
  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/browse");
    }
  }, [isAuthenticated, navigate]);

  const handleSigninChange = (e) => {
    setSigninForm({
      ...signinForm,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignupChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signinForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Update AuthContext with user data and token
      const userData = { ...data.user, role: "customer" };
      setAuthUser(userData, data.accessToken);

      // Navigation will happen via the useEffect watching isAuthenticated
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Update AuthContext with user data and token
      const userData = { ...data.user, role: "customer" };
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            CineSphere
          </h1>
          <p className="text-gray-400">Book Your Perfect Movie Experience</p>
        </div>

        {/* Tab Cards */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => {
                setActiveTab("signin");
                setError("");
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "signin"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError("");
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "signup"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Sign In Tab */}
            {activeTab === "signin" && (
              <form onSubmit={handleSignin} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={signinForm.email}
                      onChange={handleSigninChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                      placeholder="you@example.com"
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
                      value={signinForm.password}
                      onChange={handleSigninChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50 mt-6"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="text-center text-sm text-gray-400 mt-4">
                  <Link to="#" className="text-cyan-400 hover:text-cyan-300">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            )}

            {/* Sign Up Tab */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    className="w-full bg-slate-700 text-white rounded-lg py-3 px-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={signupForm.phone}
                    onChange={handleSignupChange}
                    className="w-full bg-slate-700 text-white rounded-lg py-3 px-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                    placeholder="+91XXXXXXXXXX"
                    required
                  />
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
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-cyan-400 focus:outline-none transition"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50 mt-6"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
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

export default CustomerLogin;
