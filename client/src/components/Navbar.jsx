import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Ticket, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, userRole } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const getNavigation = () => {
    switch (userRole) {
      case "customer":
        return [
          { label: "Home", path: "/" },
          { label: "My Tickets", path: "/tickets" },
        ];
      case "theatreAdmin":
        return [
          { label: "Dashboard", path: "/admin/dashboard" },
          { label: "Movies", path: "/admin/movies" },
          { label: "Showtimes", path: "/admin/showtimes" },
          { label: "Hall Layout", path: "/admin/layout" },
          { label: "Bookings", path: "/admin/bookings" },
        ];
      case "superadmin":
        return [
          { label: "Dashboard", path: "/superadmin/dashboard" },
          { label: "Theatres", path: "/superadmin/dashboard" },
          { label: "Movies", path: "/superadmin/movies" },
          { label: "Approvals", path: "/superadmin/dashboard" },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/" : "/auth"}
            className="flex items-center gap-2 group"
          >
            <Ticket className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition" />
            <span className="text-2xl font-bold text-white">CineSphere</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {getNavigation().map((item, index) => (
              <Link
                key={`nav-${userRole}-${index}`}
                to={item.path}
                className="hover:text-cyan-400 transition duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-lg">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register-customer"
                  className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {getNavigation().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-lg hover:bg-slate-700 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-slate-700 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-slate-300 mb-2">
                    {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 hover:bg-slate-700 rounded-lg transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register-customer"
                    className="block px-3 py-2 hover:bg-slate-700 rounded-lg transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
