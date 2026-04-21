import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Plus, Trash2, Edit2, Clock } from "lucide-react";

export default function TheatreShowtimes() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch showtimes
        const showtimesRes = await fetch(
          `http://localhost:5000/api/showtimes?theatreId=${userTheatreId}&admin=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const showtimesData = await showtimesRes.json();
        if (showtimesRes.ok) {
          const allShowtimes = Array.isArray(showtimesData.data)
            ? showtimesData.data
            : [];
          setShowtimes(allShowtimes);
        }

        // Fetch theatre details
        const theatreRes = await fetch(
          `http://localhost:5000/api/theatres/${userTheatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const theatreData = await theatreRes.json();
        if (theatreRes.ok) {
          setTheatre(theatreData.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchData();
    }
  }, [userTheatreId]);

  // Filter and group showtimes by date and screen
  useEffect(() => {
    const filtered = showtimes.filter((showtime) => {
      const showtimeDate = new Date(showtime.date).toISOString().split("T")[0];
      return showtimeDate === selectedDate;
    });
    setFilteredShowtimes(
      filtered.sort(
        (a, b) => a.screen - b.screen || a.time.localeCompare(b.time),
      ),
    );
  }, [showtimes, selectedDate]);

  const handleDelete = async (showtimeId) => {
    if (!window.confirm("Are you sure you want to delete this showtime?")) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/showtimes/${showtimeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setShowtimes(showtimes.filter((s) => s._id !== showtimeId));
        setDeleteId(null);
      } else {
        alert("Failed to delete showtime");
      }
    } catch (err) {
      console.error("Error deleting showtime:", err);
      alert("Error deleting showtime");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Theatre Showtimes</h1>
                <p className="text-slate-400">
                  Create and manage showtimes for your theatre
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/showtimes/new")}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Add Showtime
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Date Filter */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <div className="flex items-center gap-4">
              <label className="text-slate-400">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="ml-auto text-right">
                <p className="text-slate-400 text-sm">Showtimes Today</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {filteredShowtimes.length}
                </p>
              </div>
            </div>
          </div>

          {/* Showtimes List Grouped by Screen */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-slate-400">Loading showtimes...</p>
            </div>
          ) : filteredShowtimes.length > 0 ? (
            <div className="space-y-8">
              {/* Check for showtimes with undefined or invalid screens */}
              {(() => {
                const invalidShowtimes = filteredShowtimes.filter(
                  (s) =>
                    !s.screen ||
                    s.screen < 1 ||
                    (theatre && s.screen > theatre.numberOfScreens),
                );
                if (invalidShowtimes.length > 0) {
                  return (
                    <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 mb-8">
                      <h3 className="text-2xl font-bold mb-4 text-red-400">
                        ⚠️ Invalid Screen Assignment
                      </h3>
                      <p className="text-red-300 mb-4">
                        The following {invalidShowtimes.length} showtime(s) have
                        invalid screen numbers and need to be fixed:
                      </p>
                      <div className="space-y-2">
                        {invalidShowtimes.map((showtime) => (
                          <div
                            key={showtime._id}
                            className="bg-red-800 rounded p-3 flex justify-between items-center"
                          >
                            <span>
                              {showtime.movieId?.title} at {showtime.time} (
                              Screen: {showtime.screen || "None"})
                            </span>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/showtimes/edit/${showtime._id}`,
                                )
                              }
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
                            >
                              Fix Screen
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {theatre &&
                theatre.numberOfScreens > 0 &&
                Array.from(
                  { length: theatre.numberOfScreens },
                  (_, i) => i + 1,
                ).map((screenNum) => {
                  const screenShowtimes = filteredShowtimes.filter(
                    (s) => s.screen === screenNum,
                  );

                  return (
                    <div key={screenNum}>
                      <h3 className="text-2xl font-bold mb-4 text-cyan-400">
                        Screen {screenNum}
                      </h3>
                      {screenShowtimes.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {screenShowtimes.map((showtime) => (
                            <div
                              key={showtime._id}
                              className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-cyan-500 transition"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold mb-1">
                                    {showtime.movieId?.title || "Unknown Movie"}
                                  </h3>
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={16} />
                                    <span>{showtime.time}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/admin/showtimes/edit/${showtime._id}`,
                                      )
                                    }
                                    className="p-2 hover:bg-slate-700 rounded-lg transition text-amber-400"
                                    title="Edit showtime"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(showtime._id)}
                                    disabled={
                                      deleting && deleteId === showtime._id
                                    }
                                    className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400 disabled:opacity-50"
                                    title="Delete showtime"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm mb-4">
                                <p>
                                  <span className="text-slate-400">
                                    Total Seats:
                                  </span>
                                  <span className="ml-2 font-semibold">
                                    {showtime.totalSeats || 112}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-slate-400">
                                    Available:
                                  </span>
                                  <span className="ml-2 font-semibold text-green-400">
                                    {showtime.availableSeats || 0}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-slate-400">
                                    Booked:
                                  </span>
                                  <span className="ml-2 font-semibold text-amber-400">
                                    {(showtime.totalSeats || 112) -
                                      (showtime.availableSeats || 0)}
                                  </span>
                                </p>
                              </div>

                              {/* Seat Status Bar */}
                              <div className="bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-full"
                                  style={{
                                    width: `${((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats) * 100}%`,
                                  }}
                                ></div>
                              </div>

                              <button
                                onClick={() =>
                                  navigate(`/admin/showtimes/${showtime._id}`)
                                }
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition"
                              >
                                View Details
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                          <p className="text-slate-400">
                            No showtimes scheduled for this screen
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
              <p className="text-slate-400 text-lg mb-4">
                No showtimes scheduled for this date
              </p>
              <button
                onClick={() => navigate("/admin/showtimes/new")}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Create First Showtime
              </button>
            </div>
          )}

          {/* All Showtimes Summary */}
          {showtimes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">All Showtimes Summary</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Total Showtimes</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {showtimes.length}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Total Seats</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {showtimes.reduce((sum, s) => sum + (s.totalSeats || 0), 0)}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Available</p>
                  <p className="text-3xl font-bold text-green-400">
                    {showtimes.reduce(
                      (sum, s) => sum + (s.availableSeats || 0),
                      0,
                    )}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Occupancy</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {showtimes.length > 0
                      ? (
                          ((showtimes.reduce(
                            (sum, s) => sum + (s.totalSeats || 0),
                            0,
                          ) -
                            showtimes.reduce(
                              (sum, s) => sum + (s.availableSeats || 0),
                              0,
                            )) /
                            showtimes.reduce(
                              (sum, s) => sum + (s.totalSeats || 0),
                              0,
                            )) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
