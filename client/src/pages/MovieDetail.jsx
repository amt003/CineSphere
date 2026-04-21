import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Clock, MapPin, Users, Volume2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MovieDetail() {
  const { id, theatreId } = useParams();
  const navigate = useNavigate();
  const { error: showError, warning } = useToast();
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get proper poster URL
  const getPosterUrl = (url) => {
    if (!url || url.trim() === "") {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%232d3748'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%2390cdf4' text-anchor='middle' dominant-baseline='middle'%3EMovie Poster%3C/text%3E%3C/svg%3E";
    }
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("/uploads")) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMovie(data.data);
        } else {
          showError("Failed to load movie details");
        }
      } catch (err) {
        showError("Error loading movie. Please try again.");
      }
    };

    if (id) fetchMovie();
  }, [id]);

  // Fetch showtimes for this movie
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movie || !theatreId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/showtimes?movieId=${movie._id}&theatreId=${theatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          // Get today's date for filtering
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Get end of range (today + 3 days)
          const endOfRange = new Date(today);
          endOfRange.setDate(endOfRange.getDate() + 3);
          endOfRange.setHours(0, 0, 0, 0);

          // Filter showtimes to only show today and next 2 days, and deduplicate
          const filteredShowtimes = (data.data || []).filter((showtime) => {
            const showtimeDate = new Date(showtime.date);
            showtimeDate.setHours(0, 0, 0, 0);
            return showtimeDate >= today && showtimeDate < endOfRange;
          });

          const uniqueShowtimes = Array.from(
            new Map(
              filteredShowtimes.map((s) => [`${s.date}${s.time}`, s]),
            ).values(),
          );

          // Sort by date, then by time
          const sortedShowtimes = uniqueShowtimes.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }

            // Convert 12-hour time format to 24-hour (in minutes) for proper sorting
            const convertTo24Hour = (timeStr) => {
              const parts = timeStr.match(/(\d+):(\d+)\s(AM|PM)/i);
              if (!parts) return 0;

              let hours = parseInt(parts[1]);
              const minutes = parseInt(parts[2]);
              const period = parts[3].toUpperCase();

              if (period === "PM" && hours !== 12) hours += 12;
              if (period === "AM" && hours === 12) hours = 0;

              return hours * 60 + minutes;
            };

            const timeA = convertTo24Hour(a.time);
            const timeB = convertTo24Hour(b.time);
            return timeA - timeB;
          });

          setShowtimes(sortedShowtimes);

          // Set the first date as selected by default
          if (sortedShowtimes.length > 0) {
            const date = new Date(sortedShowtimes[0].date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            setSelectedDate(dateStr);
          }
        } else {
          showError("Failed to load showtimes");
        }
      } catch (err) {
        showError("Error loading showtimes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (movie && theatreId) fetchShowtimes();
  }, [movie, theatreId]);

  // Fetch theatre details for display
  useEffect(() => {
    const fetchTheatre = async () => {
      if (!theatreId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/theatres/${theatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setTheatre(data.data);
        }
      } catch (err) {
        console.error("Error loading theatre:", err);
      }
    };

    if (theatreId) fetchTheatre();
  }, [theatreId]);

  const handleBookSeats = () => {
    if (selectedShowtime) {
      navigate(`/booking/${selectedShowtime._id}`);
    }
  };

  // Format date as "17th April 2026"
  const formatDateLong = (dateInput) => {
    let date;

    if (typeof dateInput === "string") {
      if (dateInput.includes("-") && dateInput.length === 10) {
        // Format: YYYY-MM-DD
        const [year, month, day] = dateInput.split("-").map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // ISO format or other formats - use new Date directly
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const getDayOrdinal = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getDayOrdinal(day)} ${month} ${year}`;
  };

  // Get day name from date
  const getDayName = (dateInput) => {
    let date;

    if (typeof dateInput === "string") {
      if (dateInput.includes("-") && dateInput.length === 10) {
        // Format: YYYY-MM-DD
        const [year, month, day] = dateInput.split("-").map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // ISO format or other formats - use new Date directly
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Get unique dates from showtimes with formatting
  const uniqueDates = Array.from(
    new Set(
      showtimes.map((s) => {
        const date = new Date(s.date);
        // Use a consistent date key that won't have timezone issues
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }),
    ),
  )
    .map((dateStr) => {
      // Parse the date string to avoid timezone issues
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      return {
        key: dateStr,
        formatted: formatDateLong(date),
        day: getDayName(date),
      };
    })
    .sort((a, b) => {
      const [aYear, aMonth, aDay] = a.key.split("-").map(Number);
      const [bYear, bMonth, bDay] = b.key.split("-").map(Number);
      const dateA = new Date(aYear, aMonth - 1, aDay);
      const dateB = new Date(bYear, bMonth - 1, bDay);
      return dateA.getTime() - dateB.getTime();
    });

  // Get showtimes for selected date
  const showtimesForSelectedDate = showtimes.filter((s) => {
    const date = new Date(s.date);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return dateStr === selectedDate;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Loading movie details...</p>
        </div>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Movie not found</p>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      {/* Movie Header */}
      <div className="relative h-96 bg-gradient-to-r from-slate-900 to-cyan-900">
        <img
          src={getPosterUrl(movie?.posterUrl)}
          alt={movie?.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex gap-8 w-full">
            <img
              src={getPosterUrl(movie?.posterUrl)}
              alt={movie?.title}
              className="w-40 h-56 rounded-lg shadow-2xl object-cover"
            />
            <div className="flex-1 text-white">
              <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 text-gray-300 mb-4">
                <span className="bg-cyan-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {movie.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {movie.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="w-4 h-4" /> {movie.language || "English"}
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-2xl">
                {movie.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-cyan-400">Genres:</span>{" "}
                  {movie.genre?.join(", ") || "N/A"}
                </div>
                {theatre && (
                  <div>
                    <span className="text-cyan-400">Theatre:</span>{" "}
                    {theatre.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Showtime */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">
          Select a Showtime
        </h2>

        {showtimes.length > 0 ? (
          <>
            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Select Date
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {uniqueDates.map((dateObj) => (
                  <button
                    key={dateObj.key}
                    onClick={() => {
                      setSelectedDate(dateObj.key);
                      setSelectedShowtime(null);
                    }}
                    className={`px-5 py-3 rounded-lg border-2 transition whitespace-nowrap text-center ${
                      selectedDate === dateObj.key
                        ? "border-cyan-500 bg-cyan-500/10 text-white"
                        : "border-gray-600 bg-slate-700/50 text-gray-300 hover:border-cyan-400"
                    }`}
                  >
                    <div className="font-semibold">{dateObj.formatted}</div>
                    <div className="text-sm text-gray-400">{dateObj.day}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection for Selected Date */}
            {selectedDate && showtimesForSelectedDate.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">
                  Select Time
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {showtimesForSelectedDate.map((showtime) => (
                    <button
                      key={showtime._id}
                      onClick={() => setSelectedShowtime(showtime)}
                      disabled={!showtime.bookable}
                      className={`p-4 rounded-lg border-2 transition ${
                        !showtime.bookable
                          ? "border-gray-500 bg-slate-800/50 cursor-not-allowed opacity-50"
                          : selectedShowtime?._id === showtime._id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-gray-600 bg-slate-700/50 hover:border-cyan-400"
                      }`}
                    >
                      <div className="text-white font-bold text-lg mb-2">
                        {showtime.time}
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400 text-sm mb-2">
                        <Users className="w-4 h-4" />
                        <span>{showtime.availableSeats || 0} seats</span>
                      </div>
                      {showtime.availableSeats === 0 && (
                        <div className="text-xs text-red-400">Sold Out</div>
                      )}
                      {!showtime.bookable && (
                        <div className="text-xs text-yellow-400 mt-2">
                          Booking Closed
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-slate-700/30 border border-gray-600 rounded-lg p-6 text-center mb-8">
                <p className="text-gray-400">
                  No showtimes available for the selected date
                </p>
              </div>
            )}

            {selectedShowtime && (
              <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-6 mb-8">
                <h3 className="text-white font-bold text-lg mb-4">
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-gray-300 mb-6">
                  <div>
                    <span className="text-cyan-400">Movie:</span> {movie.title}
                  </div>
                  <div>
                    <span className="text-cyan-400">Time:</span>{" "}
                    {selectedShowtime.time}
                  </div>
                  <div>
                    <span className="text-cyan-400">Date:</span>{" "}
                    {formatDateLong(selectedShowtime.date)}
                  </div>
                  <div>
                    <span className="text-cyan-400">Available Seats:</span>{" "}
                    {selectedShowtime.availableSeats}
                  </div>
                </div>
                <button
                  onClick={handleBookSeats}
                  disabled={selectedShowtime.availableSeats === 0}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Proceed to Seat Selection
                </button>
              </div>
            )}

            {!selectedShowtime && (
              <div className="bg-slate-700/30 border border-gray-600 rounded-lg p-6 text-center">
                <p className="text-gray-400">
                  Please select a date and time to proceed with booking
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-700/30 border border-gray-600 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              No showtimes available for this movie at the selected theatre
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
