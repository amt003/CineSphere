import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Film, Clock, Ticket } from "lucide-react";

export default function TheatreAdminDashboard() {
  const { user, userTheatreId } = useAuth();
  const [theatre, setTheatre] = useState(null);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalShowtimes: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/theatres/${userTheatreId}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (response.ok) {
          setTheatre(data.data.theatre);
          setStats(data.data.stats);
          setRecentBookings(data.data.recentBookings || []);
        }
      } catch (err) {
        console.error("Error fetching theatre data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchDashboardData();
    }
  }, [userTheatreId]);

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
      title: "Active Movies",
      value: stats.totalMovies,
      icon: Film,
      color: "cyan",
      bgColor: "bg-cyan-500",
    },
    {
      title: "Total Showtimes",
      value: stats.totalShowtimes,
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-500",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Ticket,
      color: "green",
      bgColor: "bg-green-500",
    },
    {
      title: "Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: BarChart3,
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
            <h1 className="text-4xl font-bold mb-2">Theatre Dashboard</h1>
            {theatre && (
              <p className="text-slate-400">
                Welcome back, {user?.name}! Here's your {theatre.name} overview.
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Theatre Info */}
          {theatre && (
            <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{theatre.name}</h2>
                  <p className="text-slate-400 mb-4">{theatre.location}</p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
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
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Hall Layout</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-slate-400">Rows:</span>
                      <span className="ml-2">
                        {theatre.hallLayout?.rows || 8}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Seats per Row:</span>
                      <span className="ml-2">
                        {theatre.hallLayout?.seatsPerRow || 14}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Total Seats:</span>
                      <span className="ml-2">
                        {(theatre.hallLayout?.rows || 8) *
                          (theatre.hallLayout?.seatsPerRow || 14)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">VIP Rows:</span>
                      <span className="ml-2">
                        {theatre.hallLayout?.vipRows?.join(", ") || "A, B"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                {
                  label: "Manage Movies",
                  action: () => navigate("/admin/movies"),
                },
                {
                  label: "Create Showtime",
                  action: () => navigate("/admin/showtimes/new"),
                },
                {
                  label: "View Bookings",
                  action: () => navigate("/admin/bookings"),
                },
                {
                  label: "View Showtimes",
                  action: () => navigate("/admin/showtimes"),
                },
                {
                  label: "Analytics",
                  action: () => navigate("/admin/analytics"),
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Movie
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Screen
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Show Date
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Show Time
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Seats
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-700 hover:bg-slate-700 transition"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">
                              {booking.customerName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {booking.customerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {booking.movieTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-cyan-600 bg-opacity-30 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
                            Screen {booking.screen}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {booking.showDate}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {booking.showTime}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-purple-600 bg-opacity-30 text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                            {booking.seats.join(", ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-400">
                          ₹{booking.amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-500 bg-opacity-20 text-green-300"
                                : booking.status === "pending"
                                  ? "bg-amber-500 bg-opacity-20 text-amber-300"
                                  : "bg-slate-500 bg-opacity-20 text-slate-300"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
