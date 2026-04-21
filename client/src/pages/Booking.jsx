import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RotateCcw, Lock, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Booking() {
  const navigate = useNavigate();
  const { showtimeId } = useParams();
  const { user, userTheatreId } = useAuth();
  const { success, error: showError, warning } = useToast();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch showtime details
  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setShowtime(data.data);
        } else if (response.status === 404) {
          showError("Showtime not found");
        } else {
          showError("Failed to load showtime details");
        }
      } catch (err) {
        showError("Error loading showtime. Please try again.");
      }
    };

    if (showtimeId) fetchShowtimeDetails();
  }, [showtimeId]);

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!showtime?.movieId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/movies/${showtime.movieId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setMovie(data.data);
        }
      } catch (err) {
        console.error("Error loading movie:", err);
      }
    };

    fetchMovieDetails();
  }, [showtime]);

  // Fetch theatre details
  useEffect(() => {
    const fetchTheatreDetails = async () => {
      if (!showtime?.theatreId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/theatres/${showtime.theatreId}`,
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

    fetchTheatreDetails();
  }, [showtime]);

  // Fetch seats for this showtime
  useEffect(() => {
    const fetchSeats = async () => {
      if (!showtimeId) return;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}/seats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setSeats(data.data || []);
        }
      } catch (err) {
        showError("Error loading seats. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  // Get seat status from seats array
  const getSeatStatus = (seatId) => {
    const seat = seats.find((s) => s.seatId === seatId);
    if (!seat) return "available";
    if (seat.status === "booked") return "booked";
    if (seat.status === "locked") return "locked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const handleSeatClick = (seatId) => {
    const status = getSeatStatus(seatId);

    if (status === "booked" || status === "locked") return;

    const newSelectedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(newSelectedSeats);

    // Calculate price based on seat type
    const newPrice = newSelectedSeats.reduce((sum, sid) => {
      const seat = seats.find((s) => s.seatId === sid);
      const price = seat?.type === "vip" ? 250 : 150;
      return sum + price;
    }, 0);
    setTotalPrice(newPrice);
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      showError("Please select at least one seat");
      return;
    }

    setIsBooking(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theatreId: showtime?.theatreId,
          showtimeId,
          seats: selectedSeats,
          totalAmount: totalPrice + 20,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        success("Booking confirmed! Redirecting to payment...");
        setTimeout(() => {
          navigate(`/payment/${data.data._id}`, {
            state: { totalAmount: totalPrice + 20, seats: selectedSeats },
          });
        }, 1500);
      } else if (response.status === 400) {
        showError(data.message || "Invalid booking request");
      } else if (response.status === 401) {
        showError("Session expired. Please login again.");
      } else {
        showError(data.message || "Failed to create booking");
      }
    } catch (err) {
      showError("Error creating booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Loading seats...</p>
        </div>
      </>
    );
  }

  if (!showtime || !movie) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Showtime or movie not found</p>
        </div>
      </>
    );
  }

  const rows = theatre?.hallLayout?.rows || 8;
  const seatsPerRow = theatre?.hallLayout?.seatsPerRow || 14;
  const vipRows = theatre?.hallLayout?.vipRows || ["A", "B"];
  const rowLetters = Array.from({ length: rows }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  // Check if booking window is closed
  const getBookingStatus = () => {
    if (!showtime) return null;

    const now = new Date();

    // Parse 12-hour format time (e.g., "09:30 AM", "01:30 PM")
    const timeMatch = showtime.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return { bookingClosed: false };

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const meridiem = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    const showtimeDateObj = new Date(showtime.date);
    showtimeDateObj.setHours(hours, minutes, 0, 0);

    const timeUntilShowtime = showtimeDateObj.getTime() - now.getTime();
    const hoursUntilShowtime = timeUntilShowtime / (1000 * 60 * 60);

    if (hoursUntilShowtime < 2) {
      return {
        bookingClosed: true,
        hoursRemaining: Math.max(0, hoursUntilShowtime),
      };
    }

    return { bookingClosed: false, hoursRemaining: hoursUntilShowtime };
  };

  const bookingStatus = getBookingStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {bookingStatus?.bookingClosed && (
          <div className="bg-red-500/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Booking Window Closed</p>
              <p className="text-sm text-red-200">
                Tickets can only be booked up to 2 hours before the showtime.
                This showtime is no longer available for booking.
              </p>
            </div>
          </div>
        )}

        {/* Show Info */}
        <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-gray-300">
            <div>
              <span className="text-cyan-400 text-sm">Time</span>
              <p className="font-semibold">{showtime.time}</p>
            </div>
            <div>
              <span className="text-cyan-400 text-sm">Date</span>
              <p className="font-semibold">
                {new Date(showtime.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-cyan-400 text-sm">Theatre</span>
              <p className="font-semibold">{theatre?.name}</p>
            </div>
            <div>
              <span className="text-cyan-400 text-sm">Available</span>
              <p className="font-semibold">{showtime.availableSeats}</p>
            </div>
            <div>
              <span className="text-cyan-400 text-sm">Seats Selected</span>
              <p className="font-semibold">{selectedSeats.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Picker */}
          <div className="lg:col-span-2">
            {/* Legend */}
            <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4 mb-8">
              <h3 className="text-white font-bold mb-4">Seat Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-500 rounded" />
                  <span className="text-gray-300 text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500 rounded" />
                  <span className="text-gray-300 text-sm">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded" />
                  <span className="text-gray-300 text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded" />
                  <span className="text-gray-300 text-sm">Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded" />
                  <span className="text-gray-300 text-sm">Booked</span>
                </div>
              </div>
            </div>

            {/* Screen */}
            <div className="bg-slate-700/30 border border-gray-600 rounded-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-b from-cyan-400 to-cyan-600 text-white px-8 py-2 rounded-full font-bold text-sm">
                  SCREEN
                </div>
              </div>

              {/* Seats Grid */}
              <div className="space-y-4">
                {rowLetters.map((row) => (
                  <div
                    key={row}
                    className="flex items-center gap-4 justify-center"
                  >
                    <span className="w-6 text-white font-bold text-center">
                      {row}
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: seatsPerRow }).map((_, i) => {
                        const seatNum = i + 1;
                        const seatId = `${row}${seatNum}`;
                        const status = getSeatStatus(seatId);
                        const isVip = vipRows.includes(row);

                        let bgColor =
                          "bg-gray-500 hover:bg-gray-400 cursor-pointer";
                        if (status === "booked")
                          bgColor = "bg-red-600 cursor-not-allowed";
                        else if (status === "locked")
                          bgColor = "bg-yellow-500 cursor-not-allowed";
                        else if (status === "selected") bgColor = "bg-cyan-500";
                        else if (isVip)
                          bgColor =
                            "bg-amber-500 hover:bg-amber-400 cursor-pointer";

                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            disabled={
                              status === "booked" || status === "locked"
                            }
                            className={`w-8 h-8 rounded ${bgColor} transition transform hover:scale-110 flex items-center justify-center`}
                            title={seatId}
                          >
                            {status === "selected" && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                            {status === "locked" && (
                              <Lock className="w-4 h-4 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-white font-bold text-center">
                      {row}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Seats Display */}
            {selectedSeats.length > 0 && (
              <div className="mt-8 bg-slate-700/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">Selected Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <div
                      key={seat}
                      className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                    >
                      {seat}
                      <button
                        onClick={() => handleSeatClick(seat)}
                        className="ml-1 hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-slate-700/50 border border-gray-600 rounded-lg p-6">
              <h3 className="text-white font-bold text-lg mb-6">
                Booking Summary
              </h3>

              {selectedSeats.length === 0 ? (
                <div className="bg-slate-600/50 border border-yellow-600 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    Select seats to proceed
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-600">
                    <div className="flex justify-between text-gray-300">
                      <span>Seats ({selectedSeats.length})</span>
                      <span className="font-semibold text-xs">
                        {selectedSeats.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Convenience Fee</span>
                      <span>₹20</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-white font-bold text-lg mb-6">
                    <span>Total</span>
                    <span>₹{totalPrice + 20}</span>
                  </div>
                </>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={
                  selectedSeats.length === 0 ||
                  isBooking ||
                  bookingStatus?.bookingClosed
                }
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                {bookingStatus?.bookingClosed
                  ? "Booking Closed"
                  : isBooking
                    ? "Processing..."
                    : "Proceed to Payment"}
              </button>

              <button
                onClick={() => {
                  setSelectedSeats([]);
                  setTotalPrice(0);
                }}
                className="w-full mt-3 border border-gray-400 text-gray-300 hover:text-white hover:border-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
