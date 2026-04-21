import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft } from "lucide-react";

// Convert 12-hour time format (e.g., "01:30 PM") to 24-hour format (e.g., "13:30")
const convertTo24HourFormat = (time12) => {
  if (!time12) return "";

  const [time, period] = time12.split(" ");
  const [hours, minutes] = time.split(":");

  let hours24 = parseInt(hours);

  if (period === "PM" && hours24 !== 12) {
    hours24 += 12;
  } else if (period === "AM" && hours24 === 12) {
    hours24 = 0;
  }

  return `${String(hours24).padStart(2, "0")}:${minutes}`;
};

// Convert 24-hour time format (e.g., "13:30") to 12-hour format (e.g., "01:30 PM")
const convertTo12HourFormat = (time24) => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":");
  let hours12 = parseInt(hours);
  const period = hours12 >= 12 ? "PM" : "AM";

  if (hours12 > 12) {
    hours12 -= 12;
  } else if (hours12 === 0) {
    hours12 = 12;
  }

  return `${String(hours12).padStart(2, "0")}:${minutes} ${period}`;
};

export default function EditShowtime() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const { showtimeId } = useParams();
  const { success, error: showError, warning } = useToast();

  const [movies, setMovies] = useState([]);
  const [theatre, setTheatre] = useState(null);
  const [existingShowtimes, setExistingShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    movieId: "",
    movieName: "",
    date: "",
    time: "",
    screen: 1,
  });

  // Current form data
  const [formData, setFormData] = useState({
    movieId: "",
    date: "",
    time: "09:30 AM",
    screen: 1,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const autoSaveDraft = () => {
      if (isDirty) {
        localStorage.setItem(
          `draft_showtime_${showtimeId}`,
          JSON.stringify(formData),
        );
      }
    };

    const timer = setTimeout(autoSaveDraft, 1000);
    return () => clearTimeout(timer);
  }, [formData, isDirty, showtimeId]);

  // Check if form has unsaved changes
  useEffect(() => {
    const hasChanges =
      formData.movieId !== originalData.movieId ||
      formData.date !== originalData.date ||
      formData.time !== convertTo24HourFormat(originalData.time) ||
      formData.screen !== originalData.screen;

    setIsDirty(hasChanges);
  }, [formData, originalData]);

  // Fetch movies and showtime data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch movies
        const moviesResponse = await fetch(
          `http://localhost:5000/api/movies?theatreId=${userTheatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const moviesData = await moviesResponse.json();
        if (moviesResponse.ok) {
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
        }

        // Fetch showtime
        const showtimeResponse = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const showtimeData = await showtimeResponse.json();
        if (showtimeResponse.ok) {
          const showtime = showtimeData.data;
          // Convert date to YYYY-MM-DD format
          const showtimeDate = new Date(showtime.date)
            .toISOString()
            .split("T")[0];

          const originalValues = {
            movieId: showtime.movieId._id,
            movieName: showtime.movieId.title,
            date: showtimeDate,
            time: showtime.time,
            screen: showtime.screen || 1,
          };

          setOriginalData(originalValues);

          // Check for autosaved draft
          const draft = localStorage.getItem(`draft_showtime_${showtimeId}`);
          if (draft) {
            setFormData(JSON.parse(draft));
            warning("Draft restored from previous session");
          } else {
            setFormData({
              movieId: showtime.movieId._id,
              date: showtimeDate,
              time: convertTo24HourFormat(showtime.time),
              screen: showtime.screen || 1,
            });
          }
        } else {
          const errorMsg =
            showtimeResponse.status === 404
              ? "Showtime not found"
              : showtimeResponse.status === 403
                ? "You don't have permission to edit this showtime"
                : "Failed to load showtime details";
          showError(errorMsg);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId && showtimeId) {
      fetchData();
    }
  }, [userTheatreId, showtimeId, showError, warning]);

  // Fetch existing showtimes for conflict warning
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
          // Filter showtimes for the selected screen and exclude current showtime
          const screenShowtimes = Array.isArray(data.data)
            ? data.data.filter(
                (s) => s.screen === formData.screen && s._id !== showtimeId,
              )
            : [];
          setExistingShowtimes(screenShowtimes);
        }
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    };

    fetchShowtimes();
  }, [formData.date, formData.screen, userTheatreId, showtimeId]);

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
      showError("Cannot set showtime to a past date");
      return;
    }

    if (selectedDate.getTime() === today.getTime()) {
      // If date is today, check if time is in the past
      const [hours24, minutes] = formData.time.split(":");
      const showtimeDate = new Date();
      showtimeDate.setHours(parseInt(hours24), parseInt(minutes), 0, 0);

      if (showtimeDate <= now) {
        showError("Cannot set showtime to a past time");
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/showtimes/${showtimeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: formData.movieId,
            date: formData.date,
            time: convertTo12HourFormat(formData.time),
            screen: formData.screen,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Clear draft after successful save
        localStorage.removeItem(`draft_showtime_${showtimeId}`);
        success("Showtime updated successfully!");
        setTimeout(() => {
          navigate("/admin/showtimes");
        }, 1500);
      } else if (response.status === 409) {
        showError(
          data.message ||
            "Conflict: Another movie is showing at this time on this screen",
        );
      } else if (response.status === 403) {
        showError("You don't have permission to edit this showtime");
      } else if (response.status === 400) {
        showError(data.message || "Invalid showtime data");
      } else if (response.status === 404) {
        showError("Showtime not found");
      } else if (response.status === 401) {
        showError("Your session has expired. Please log in again.");
        setTimeout(() => navigate("/admin/login"), 2000);
      } else {
        showError(data.message || "Failed to update showtime");
      }
    } catch (err) {
      console.error("Error updating showtime:", err);
      showError("Error updating showtime. Please try again.");
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

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      navigate("/admin/showtimes");
    }
  };

  const confirmCancel = () => {
    localStorage.removeItem(`draft_showtime_${showtimeId}`);
    setShowCancelConfirm(false);
    navigate("/admin/showtimes");
  };

  const getMovieName = (movieId) => {
    const movie = movies.find((m) => m._id === movieId);
    return movie?.title || "Unknown";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-4"
              aria-label="Back to showtimes list"
            >
              <ArrowLeft size={20} />
              Back to Showtimes
            </button>
            <h1 className="text-4xl font-bold">Edit Showtime</h1>
            <p className="text-slate-400 mt-2">Update showtime details</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">
                      Loading showtime details...
                    </p>
                  </div>
                ) : movies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-4">
                      No movies available in your theatre.
                    </p>
                    <button
                      onClick={() => navigate("/admin/dashboard")}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                      aria-label="Go to dashboard"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    aria-label="Edit showtime form"
                  >
                    {/* Movie Selection */}
                    <div>
                      <label
                        htmlFor="movieId"
                        className="block text-sm font-semibold mb-2"
                      >
                        Select Movie <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="movieId"
                        name="movieId"
                        value={formData.movieId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                        aria-label="Select a movie for this showtime"
                        aria-required="true"
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
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold mb-2"
                      >
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={today}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                        aria-label="Select showtime date"
                        aria-required="true"
                      />
                    </div>

                    {/* Existing Showtimes on Selected Screen */}
                    {formData.date && existingShowtimes.length > 0 && (
                      <div className="bg-slate-700 border border-amber-600 rounded-lg p-4">
                        <p className="text-amber-400 text-sm font-semibold mb-3">
                          ⚠️ Other movies scheduled on Screen {formData.screen}{" "}
                          this day:
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
                      <label
                        htmlFor="time"
                        className="block text-sm font-semibold mb-2"
                      >
                        Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                        aria-label="Select showtime time"
                        aria-required="true"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-500"
                        aria-label="Cancel changes and go back"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !isDirty}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        aria-label={
                          submitting ? "Updating showtime" : "Update showtime"
                        }
                        aria-disabled={submitting || !isDirty}
                      >
                        {submitting ? "Updating..." : "Update Showtime"}
                      </button>
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {isDirty && (
                      <div className="p-3 bg-amber-500 bg-opacity-10 border border-amber-500 rounded-lg text-amber-300 text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Unsaved changes (automatically saving draft)
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Side Panel - Original Info & Changes */}
            <div className="lg:col-span-1 space-y-6">
              {/* Current Showtime Info */}
              {!loading && originalData.movieId && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 text-cyan-400">
                    Current Showtime
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Movie</p>
                      <p className="font-medium">{originalData.movieName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Date</p>
                      <p className="font-medium">
                        {formatDate(originalData.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Time</p>
                      <p className="font-medium">{originalData.time}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Changes Preview */}
              {isDirty && (
                <div className="bg-gradient-to-b from-green-900 to-slate-800 rounded-lg border border-green-600 p-6">
                  <h2 className="text-lg font-semibold mb-4 text-green-400">
                    Changes Preview
                  </h2>
                  <div className="space-y-4 text-sm">
                    {formData.movieId !== originalData.movieId && (
                      <div>
                        <p className="text-slate-400 mb-1">Movie</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 rounded text-xs">
                            {originalData.movieName}
                          </span>
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded text-xs">
                            {getMovieName(formData.movieId)}
                          </span>
                        </div>
                      </div>
                    )}

                    {formData.date !== originalData.date && (
                      <div>
                        <p className="text-slate-400 mb-1">Date</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 rounded text-xs">
                            {formatDate(originalData.date)}
                          </span>
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded text-xs">
                            {formatDate(formData.date)}
                          </span>
                        </div>
                      </div>
                    )}

                    {formData.time !==
                      convertTo24HourFormat(originalData.time) && (
                      <div>
                        <p className="text-slate-400 mb-1">Time</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 rounded text-xs">
                            {originalData.time}
                          </span>
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded text-xs">
                            {convertTo12HourFormat(formData.time)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Discard Changes?
            </h3>
            <p className="text-slate-300 mb-6">
              You have unsaved changes. Your draft has been saved automatically,
              but are you sure you want to leave?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                aria-label="Keep editing"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                aria-label="Discard changes and leave"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
