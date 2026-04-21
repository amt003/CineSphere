import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Ticket, Clock, Shield, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Helper to get proper poster URL
  const getPosterUrl = (url) => {
    if (!url || url.trim() === "") {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%232d3748'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%2390cdf4' text-anchor='middle' dominant-baseline='middle'%3EMovie Poster%3C/text%3E%3C/svg%3E";
    }
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("/uploads")) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchFeaturedMovies();
  }, []);

  const fetchFeaturedMovies = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/superadmin/movies",
      );
      if (response.ok) {
        const data = await response.json();
        const featured = data.data.filter((movie) => movie.isFeatured);
        setFeaturedMovies(featured.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch featured movies:", err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const features = [
    {
      icon: Ticket,
      title: "Easy Booking",
      description: "Browse and book tickets in minutes with just a few clicks",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description:
        "Get instant confirmation and notifications for your bookings",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "Safe and secure payment processing with multiple options",
    },
    {
      icon: Sparkles,
      title: "Best Experience",
      description: "Seamless experience across all devices and platforms",
    },
  ];

  const stats = [
    { number: "500+", label: "Theatres" },
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Bookings Monthly" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-slate-950 bg-opacity-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CineSphere
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg text-slate-300 hover:text-white transition font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 mb-6">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm text-slate-300">
                The ultimate cinema booking experience
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Book Your Next
              </span>
              <br />
              <span className="text-white">Cinema Experience</span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Discover, browse, and book tickets to the latest movies at your
              favorite theatres. Fast, simple, and secure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="group px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Booking Now
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition"
                />
              </button>
              <button
                onClick={() => navigate("/admin/login")}
                className="px-8 py-4 rounded-lg border-2 border-slate-600 hover:border-cyan-400 text-white font-semibold transition hover:bg-slate-800"
              >
                Theatre Partner Login
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 mb-20">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-lg bg-slate-800 bg-opacity-50 border border-slate-700 hover:border-cyan-600 transition"
              >
                <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  {stat.number}
                </p>
                <p className="text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Featured Movies */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold mb-8 text-center">
              Featured Movies
            </h3>
            {loadingMovies ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Loading featured movies...</p>
              </div>
            ) : featuredMovies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredMovies.map((movie) => (
                  <div
                    key={movie._id}
                    className="group rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-600 transition transform hover:scale-105 cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    <div className="aspect-square bg-slate-800 relative overflow-hidden">
                      {movie.posterUrl ? (
                        <img
                          src={getPosterUrl(movie.posterUrl)}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                          <Ticket className="text-slate-500" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-800 bg-opacity-50">
                      <p className="font-semibold text-white mb-1 line-clamp-2">
                        {movie.title}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        {movie.genre.join(", ")} • {movie.duration}m
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-cyan-400">
                          {movie.rating}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/login");
                          }}
                          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-slate-400">No featured movies yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose CineSphere?</h2>
            <p className="text-xl text-slate-400">
              Experience cinema booking like never before
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-xl bg-slate-800 bg-opacity-50 border border-slate-700 hover:border-cyan-600 hover:bg-opacity-80 transition transform hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">
              Get your tickets in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Search",
                description: "Find your favorite movies and theatres",
              },
              {
                step: 2,
                title: "Select",
                description: "Choose your preferred date and time",
              },
              {
                step: 3,
                title: "Book",
                description: "Pick your seats and confirm booking",
              },
              {
                step: 4,
                title: "Enjoy",
                description: "Get your tickets and enjoy the show!",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="p-6 rounded-xl bg-slate-800 bg-opacity-50 border border-slate-700 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 items-center justify-center w-6 h-6 bg-slate-900 rounded-full border-2 border-slate-700">
                    <ArrowRight size={16} className="text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-cyan-600 border-opacity-30 bg-gradient-to-r from-cyan-600 from-10% to-blue-600 to-90% p-1">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to book?</h2>
              <p className="text-xl text-slate-300 mb-8">
                Join thousands of movie lovers and book your next cinema
                experience today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition transform hover:scale-105"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/admin/login")}
                  className="px-8 py-3 rounded-lg border-2 border-slate-600 hover:border-cyan-400 text-white font-semibold transition hover:bg-slate-800"
                >
                  Partner With Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition"
                onClick={() => navigate("/")}
              >
                <Ticket className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold">CineSphere</span>
              </div>
              <p className="text-slate-400 text-sm">
                The ultimate cinema booking platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li
                  onClick={() => navigate("/login")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Browse Movies
                </li>
                <li
                  onClick={() => navigate("/login")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  My Tickets
                </li>
                <li
                  onClick={() => navigate("/login")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Support
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Partners</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li
                  onClick={() => navigate("/admin/login")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Partner Portal
                </li>
                <li
                  onClick={() => navigate("/")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Documentation
                </li>
                <li
                  onClick={() => navigate("/")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Contact
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li
                  onClick={() => navigate("/")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  About Us
                </li>
                <li
                  onClick={() => navigate("/")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Privacy Policy
                </li>
                <li
                  onClick={() => navigate("/")}
                  className="hover:text-cyan-400 cursor-pointer transition"
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>
              &copy; 2026 CineSphere. All rights reserved. | Revolutionizing
              cinema bookings
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
