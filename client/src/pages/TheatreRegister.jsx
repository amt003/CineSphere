import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  Building2,
  Phone,
  MapPin,
  User,
} from "lucide-react";

const TheatreRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    theatreName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    screens: "",
  });

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
      const response = await fetch(
        "http://localhost:5000/api/auth/theatre/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theatreName: formData.theatreName,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            city: formData.city,
            screens: formData.screens ? parseInt(formData.screens) : null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      navigate("/admin/pending");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-500/20 p-3 rounded-full">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Register Your Theatre on CineSphere
          </h1>
          <p className="text-gray-400">
            Join our platform and start accepting online bookings
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Theatre Details Section */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Theatre Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Theatre Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="theatreName"
                      value={formData.theatreName}
                      onChange={handleChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                      placeholder="e.g., PVR Cinemas Kochi"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    City/Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                      placeholder="e.g., Kochi, Kerala"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Number of Screens (Optional)
                  </label>
                  <input
                    type="number"
                    name="screens"
                    value={formData.screens}
                    onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded-lg py-3 px-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                    placeholder="e.g., 5"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Owner Details Section */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

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
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                      placeholder="+91XXXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
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
                      placeholder="owner@theatre.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div>
              <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-slate-700 text-white rounded-lg py-3 pl-10 pr-4 border border-slate-600 focus:border-amber-400 focus:outline-none transition"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition disabled:opacity-50 mt-8"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <span className="font-semibold">Next step:</span> We'll review
              your information and send you an approval email within 24–48
              hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/admin/login"
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Sign in here
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

export default TheatreRegister;
