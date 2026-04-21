import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, TrendingUp, DollarSign, Users, Ticket } from "lucide-react";

export default function TheatreAnalytics() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalShowtimes: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          const dashData = data.data.stats;
          setStats({
            totalBookings: dashData.totalBookings || 0,
            totalRevenue: dashData.totalRevenue || 0,
            totalShowtimes: dashData.totalShowtimes || 0,
            occupancyRate: dashData.totalBookings > 0 ? 75 : 0, // Placeholder calculation
          });
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchAnalytics();
    }
  }, [userTheatreId]);

  const analyticsCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Ticket,
      color: "cyan",
      bgColor: "bg-cyan-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-500",
    },
    {
      title: "Active Showtimes",
      value: stats.totalShowtimes,
      icon: TrendingUp,
      color: "amber",
      bgColor: "bg-amber-500",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      icon: Users,
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
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-4"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-2">Theatre Analytics</h1>
            <p className="text-slate-400">
              Monitor your theatre's performance and bookings
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-slate-400">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Analytics Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {analyticsCards.map((card) => {
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
                          <Icon
                            className={`text-${card.color}-400`}
                            size={24}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insights Section */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Key Insights</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Revenue Trends
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Your theatre has generated ₹
                      {stats.totalRevenue.toLocaleString()} in total revenue
                      across all bookings.
                    </p>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Booking Activity
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Total of {stats.totalBookings} bookings have been made
                      across all showtimes.
                    </p>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: "48%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
                <h2 className="text-2xl font-bold mb-6">Recommendations</h2>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <div className="bg-cyan-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Add More Showtimes</h3>
                      <p className="text-slate-400 text-sm">
                        Consider adding peak-hour showtimes to maximize
                        occupancy rates
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="bg-cyan-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Promotional Offers</h3>
                      <p className="text-slate-400 text-sm">
                        Implement weekend discounts or bulk booking offers to
                        increase revenue
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="bg-cyan-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Monitor Performance
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Check this dashboard regularly to track trends and
                        optimize operations
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
