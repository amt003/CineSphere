import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft } from "lucide-react";

export default function CreateShowtime() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [movies, setMovies] = useState([]);
  const [theatre, setTheatre] = useState(null);
  const [existingShowtimes, setExistingShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    movieId: "",
    date: "",
    time: "09:30 AM",
    screen: 1,
  });
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch movies
        const moviesRes = await fetch(
          `http://localhost:5000/api/movies?theatreId=${userTheatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const moviesData = await moviesRes.json();
        if (moviesRes.ok) {
          const moviesList = Array.isArray(moviesData.data)
            ? moviesData.data
            : [];
          setMovies(moviesList);
        }

        // Fetch theatre details (numberOfScreens)
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
          setFormData((prev) => ({
            ...prev,
            screen: 1,
          }));
        } else {
          console.error("Theatre fetch failed:", theatreRes.status);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchData();
    }
  }, [userTheatreId, showError]);

  // Fetch existing showtimes when date or screen changes
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!formData.date || !formData.screen) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/showtimes?theatreId=${userTheatreId}&date=${formData.date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          // Filter showtimes for the selected screen
          const screenShowtimes = Array.isArray(data.data)
            ? data.data.filter((s) => s.screen === formData.screen)
            : [];
          setExistingShowtimes(screenShowtimes);
        }
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    };

    fetchShowtimes();
  }, [formData.date, formData.screen, userTheatreId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.movieId ||
      !formData.date ||
      !formData.time ||
      !formData.screen
    ) {
      showError("Please fill in all fields");
      return;
    }

    // Validate that the date/time is not in the past
    const now = new Date();
    const selectedDate = new Date(formData.date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showError("Cannot create showtime for a past date");
      return;
    }

    if (selectedDate.getTime() === today.getTime()) {
      // If date is today, check if time is in the past
      const [hours24, minutes] = formData.time.split(":");
      const showtimeDate = new Date();
      showtimeDate.setHours(parseInt(hours24), parseInt(minutes), 0, 0);

      if (showtimeDate <= now) {
        showError("Cannot create showtime for a past time");
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/showtimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        success("Showtime created successfully!");
        setTimeout(() => {
          navigate("/admin/showtimes");
        }, 1500);
      } else if (response.status === 409) {
        showError(
          data.message ||
            "Conflict: Another movie is showing at this time on this screen",
        );
      } else if (response.status === 400) {
        showError(data.message || "Invalid showtime data");
      } else if (response.status === 403) {
        showError("You don't have permission to create showtimes");
      } else {
        showError(data.message || "Failed to create showtime");
      }
    } catch (err) {
      console.error("Error creating showtime:", err);
      showError("Error creating showtime. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <button
              onClick={() => navigate("/admin/showtimes")}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-4"
            >
              <ArrowLeft size={20} />
              Back to Showtimes
            </button>
            <h1 className="text-4xl font-bold">Create Showtime</h1>
            <p className="text-slate-400 mt-2">
              Add a new showtime to your theatre schedule
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Loading movies...</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">
                  No movies added to your theatre yet.
                </p>
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Movie Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Select Movie <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Choose a movie...</option>
                    {movies.map((movie) => (
                      <option key={movie._id} value={movie._id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Screen Selection */}
                {theatre && theatre.numberOfScreens > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Select Screen <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from(
                        { length: theatre.numberOfScreens },
                        (_, i) => i + 1,
                      ).map((screenNum) => (
                        <button
                          key={screenNum}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              screen: screenNum,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            formData.screen === screenNum
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          Screen {screenNum}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-slate-400 text-sm mt-2">
                    Showtimes can only be created for today or later. For today,
                    only future times are allowed.
                  </p>
                </div>

                {/* Existing Showtimes on Selected Screen */}
                {formData.date && existingShowtimes.length > 0 && (
                  <div className="bg-slate-700 border border-amber-600 rounded-lg p-4">
                    <p className="text-amber-400 text-sm font-semibold mb-3">
                      ⚠️ Other movies scheduled on Screen {formData.screen} this
                      day:
                    </p>
                    <div className="space-y-2">
                      {existingShowtimes.map((showtime) => (
                        <div
                          key={showtime._id}
                          className="text-slate-300 text-sm"
                        >
                          • {showtime.movieId?.title || "Unknown"} at{" "}
                          {showtime.time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Time <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="09:30 AM">9:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="03:30 PM">3:30 PM</option>
                    <option value="06:00 PM">6:00 PM</option>
                    <option value="08:30 PM">8:30 PM</option>
                    <option value="11:00 PM">11:00 PM</option>
                  </select>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/showtimes")}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {submitting ? "Creating..." : "Create Showtime"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
