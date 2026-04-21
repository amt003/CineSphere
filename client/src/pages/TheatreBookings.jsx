import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default function TheatreBookings() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // First, fetch all showtimes for this theatre
        const showtimesResponse = await fetch(
          `http://localhost:5000/api/showtimes?theatreId=${userTheatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const showtimesData = await showtimesResponse.json();
        const showtimes = Array.isArray(showtimesData.data)
          ? showtimesData.data
          : [];
        const showtimeIds = showtimes.map((s) => s._id);

        // Then fetch bookings for these showtimes
        if (showtimeIds.length > 0) {
          // Since there's no direct API to fetch bookings by showtimeIds,
          // we'll need to fetch from theatre dashboard which has this info
          const dashboardResponse = await fetch(
            `http://localhost:5000/api/theatres/${userTheatreId}/bookings`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            setBookings(dashboardData.data.bookings || []);
          } else {
            // Fallback: show empty bookings if endpoint not available yet
            setBookings([]);
          }
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchBookings();
    }
  }, [userTheatreId]);

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = bookings;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.id?.includes(searchTerm),
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 bg-opacity-20 text-green-300";
      case "pending":
        return "bg-amber-500 bg-opacity-20 text-amber-300";
      case "cancelled":
        return "bg-red-500 bg-opacity-20 text-red-300";
      default:
        return "bg-slate-500 bg-opacity-20 text-slate-300";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-4xl font-bold">Theatre Bookings</h1>
            <p className="text-slate-400 mt-2">
              View and manage all bookings for your theatre
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by customer, movie, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-end gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-slate-400">Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Customer
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Movie
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Screen
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Show Date
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Show Time
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Seats
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-700 hover:bg-slate-700 transition"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold">
                              {booking.customerName || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {booking.customerEmail || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {booking.movieTitle || "Unknown"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-cyan-600 bg-opacity-30 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
                            Screen {booking.screen || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {booking.showDate || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {booking.showTime || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-purple-600 bg-opacity-30 text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                            {booking.seats ? booking.seats.join(", ") : "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-green-400">
                          ₹{booking.amount?.toLocaleString() || 0}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status,
                            )}`}
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
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
              <p className="text-slate-400 text-lg">No bookings found</p>
              {searchTerm && (
                <p className="text-slate-500 text-sm mt-2">
                  Try adjusting your search
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          {filteredBookings.length > 0 && (
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Total Bookings</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {filteredBookings.length}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  ₹
                  {filteredBookings
                    .reduce((sum, b) => sum + (b.amount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">
                  Confirmed Bookings
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {
                    filteredBookings.filter((b) => b.status === "confirmed")
                      .length
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
