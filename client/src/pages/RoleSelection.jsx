import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Shield } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Customer",
      description: "Book movie tickets at your favorite theatres",
      icon: Users,
      path: "/login-customer",
      color: "cyan",
      bgGradient: "from-cyan-600 to-cyan-700",
    },
    {
      title: "Theatre Staff",
      description: "Manage movies, showtimes, and bookings",
      icon: Briefcase,
      path: "/login-staff",
      color: "amber",
      bgGradient: "from-amber-600 to-amber-700",
    },
    {
      title: "Administrator",
      description: "Oversee platform, approve theatres",
      icon: Shield,
      path: "/login-admin",
      color: "red",
      bgGradient: "from-red-600 to-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">CineSphere</h1>
          <p className="text-xl text-slate-300">
            Multi-Tenant Cinema Booking Platform
          </p>
          <p className="text-slate-400 mt-2">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.path}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => navigate(role.path)}
              >
                <div
                  className={`bg-gradient-to-br ${role.bgGradient} p-8 rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow`}
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full">
                      <Icon size={48} className="text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white text-center mb-2">
                    {role.title}
                  </h3>
                  <p className="text-white text-opacity-90 text-center text-sm">
                    {role.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                    <button className="w-full bg-white text-slate-900 font-semibold py-2 rounded-lg hover:bg-opacity-90 transition">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🎬 Powered by CineSphere Platform</p>
        </div>
      </div>
    </div>
  );
}
