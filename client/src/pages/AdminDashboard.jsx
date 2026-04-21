import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Building2, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [theatres, setTheatres] = useState([]);
  const [stats, setStats] = useState({
    totalTheatres: 0,
    activeTheatres: 0,
    pendingApprovals: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("http://localhost:5000/api/theatres", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          const theatreList = data.data || [];
          setTheatres(theatreList);

          // Calculate stats
          setStats({
            totalTheatres: theatreList.length,
            activeTheatres: theatreList.filter((t) => t.status === "active")
              .length,
            pendingApprovals: theatreList.filter((t) => t.status === "pending")
              .length,
            totalBookings: 0, // Would be calculated from bookings API
          });
        }
      } catch (err) {
        console.error("Error fetching theatres:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

  const statCards = [
    {
      title: "Total Theatres",
      value: stats.totalTheatres,
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-500",
    },
    {
      title: "Active Theatres",
      value: stats.activeTheatres,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-500",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Users,
      color: "amber",
      bgColor: "bg-amber-500",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">
              Platform Admin Dashboard
            </h1>
            <p className="text-slate-400">
              Manage theatres, approvals, and platform analytics
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold">{card.value}</p>
                    </div>
                    <div
                      className={`${card.bgColor} bg-opacity-20 p-3 rounded-lg`}
                    >
                      <Icon className={`text-${card.color}-400`} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theatres Management */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold mb-6">Theatres Management</h2>

            {theatres.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">
                        Theatre Name
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Admin
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {theatres.map((theatre) => (
                      <tr
                        key={theatre._id}
                        className="border-b border-slate-700 hover:bg-slate-700 transition"
                      >
                        <td className="py-3 px-4">{theatre.name}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {theatre.location}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {theatre.adminId?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              theatre.status === "active"
                                ? "bg-green-500 bg-opacity-20 text-green-300"
                                : theatre.status === "pending"
                                  ? "bg-amber-500 bg-opacity-20 text-amber-300"
                                  : "bg-red-500 bg-opacity-20 text-red-300"
                            }`}
                          >
                            {theatre.status.charAt(0).toUpperCase() +
                              theatre.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {theatre.status === "pending" && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/theatre/${theatre._id}/approve`,
                                )
                              }
                              className="text-green-400 hover:text-green-300 transition text-sm"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400">No theatres found</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "View All Theatres", path: "/admin/theatres" },
                { label: "Platform Analytics", path: "/admin/analytics" },
                { label: "System Settings", path: "/admin/settings" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
