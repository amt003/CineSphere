import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Loader,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending"); // pending, all, stats
  const [theatres, setTheatres] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTheatres();
  }, [activeTab]);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      let url = "http://localhost:5000/api/theatres/";

      if (activeTab === "pending") {
        url += "pending/all";
      } else if (activeTab === "all") {
        url += "approval/all";
      } else {
        url += "approval/all";
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTheatres(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.message || "Failed to load theatres");
      }
    } catch (err) {
      setError("Error loading theatres: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTheatre = async (theatreId) => {
    try {
      setActionLoading(theatreId);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/theatres/${theatreId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "active" }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Theatre approved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        // Update local state
        setTheatres(
          theatres.map((t) =>
            t._id === theatreId ? { ...t, status: "active" } : t,
          ),
        );
      } else {
        setError(data.message || "Failed to approve theatre");
      }
    } catch (err) {
      setError("Error approving theatre: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTheatre = async (theatreId) => {
    try {
      setActionLoading(theatreId);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:5000/api/theatres/${theatreId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "suspended" }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Theatre rejected successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        // Update local state
        setTheatres(
          theatres.map((t) =>
            t._id === theatreId ? { ...t, status: "suspended" } : t,
          ),
        );
      } else {
        setError(data.message || "Failed to reject theatre");
      }
    } catch (err) {
      setError("Error rejecting theatre: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-600",
      active: "bg-green-500/20 text-green-400 border-green-600",
      suspended: "bg-red-500/20 text-red-400 border-red-600",
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage theatre approvals and status</p>
        </div>

        {/* Stats Cards */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Theatres</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-slate-500 opacity-50" />
              </div>
            </div>

            <div className="bg-slate-700/50 border border-yellow-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </div>

            <div className="bg-slate-700/50 border border-green-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-slate-700/50 border border-red-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm mb-1">Suspended</p>
                  <p className="text-3xl font-bold text-red-400">
                    {stats.suspended}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "pending"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 text-gray-400 hover:text-white"
            }`}
          >
            Pending Approval ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "all"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 text-gray-400 hover:text-white"
            }`}
          >
            All Theatres
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading theatres...</span>
          </div>
        )}

        {/* Theatres List */}
        {!loading && (
          <div className="space-y-4">
            {theatres.length > 0 ? (
              theatres.map((theatre) => (
                <div
                  key={theatre._id}
                  className="bg-slate-700/50 border border-gray-600 rounded-lg p-6 hover:shadow-lg transition"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Theatre Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-cyan-500/20 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {theatre.name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {theatre.location}
                            </div>
                            {theatre.adminId && (
                              <>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  {theatre.adminId.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  {theatre.adminId.email}
                                </div>
                                {theatre.adminId.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    {theatre.adminId.phone}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Details */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${getStatusBadge(
                              theatre.status,
                            )}`}
                          >
                            {getStatusIcon(theatre.status)}
                            {theatre.status.charAt(0).toUpperCase() +
                              theatre.status.slice(1)}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Registered: {formatDate(theatre.createdAt)}
                          </div>
                          {theatre.approvalDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Approved: {formatDate(theatre.approvalDate)}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {theatre.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleApproveTheatre(theatre._id)}
                              disabled={actionLoading === theatre._id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {actionLoading === theatre._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTheatre(theatre._id)}
                              disabled={actionLoading === theatre._id}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {actionLoading === theatre._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        )}

                        {theatre.status !== "pending" && (
                          <div className="text-xs text-gray-400 pt-2">
                            Status:{" "}
                            {theatre.status === "active"
                              ? "Approved and operating"
                              : "Rejected or suspended"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  {activeTab === "pending"
                    ? "No Pending Approvals"
                    : "No Theatres Found"}
                </h3>
                <p className="text-gray-400">
                  {activeTab === "pending"
                    ? "All theatre registrations have been processed."
                    : "No theatres are currently in the system."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
