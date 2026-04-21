import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Ticket,
  MapPin,
  Clock,
  Download,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const { user } = useAuth();
  const { warning, error: showError, info } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          showError("Please login to view your tickets");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/bookings/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Filter to only show confirmed bookings
          const confirmedBookings = data.data.filter(
            (b) => b.status === "confirmed",
          );
          setBookings(
            confirmedBookings.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            ),
          );
          if (confirmedBookings.length === 0) {
            info("No confirmed bookings yet");
          }
        } else if (response.status === 401) {
          showError("Session expired. Please login again.");
        } else {
          showError(data.message || "Failed to load bookings");
        }
      } catch (err) {
        showError("Error loading bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [showError, info]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const generateQRValue = (booking) => {
    return JSON.stringify({
      bookingId: booking._id,
      movieId: booking.movieId._id,
      customerId: booking.customerId,
      seats: booking.seats,
      timestamp: booking.createdAt,
    });
  };

  const handleDownloadTicket = async (booking, index) => {
    const element = document.getElementById(`ticket-${booking._id}`);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${booking.movieId.title}-ticket-${index + 1}.png`;
        link.click();
      } catch (error) {
        console.error("Error downloading ticket:", error);
        alert("Failed to download ticket. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">View and manage your cinema bookings</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <div
                key={booking._id}
                className="bg-slate-700/50 border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Movie Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {booking.movieId.title}
                    </h3>

                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold">
                            {formatDate(
                              booking.showtimeId?.date || booking.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-400">Showtime</p>
                          <p className="font-semibold">
                            {booking.showtimeId?.time || "Time not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-400">Theatre</p>
                          <p className="font-semibold">
                            {booking.theatreId.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-400">Seats</p>
                          <p className="font-semibold">
                            {booking.seats.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Details */}
                  <div className="flex flex-col items-center justify-between">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-lg">
                      <QRCode
                        value={generateQRValue(booking)}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    {/* Booking Info */}
                    <div className="text-center mt-4 w-full">
                      <div className="inline-block border border-green-600 bg-green-500/20 rounded-full px-4 py-2 font-semibold text-sm text-green-400 mb-3">
                        ✓ Confirmed
                      </div>

                      <div className="text-sm text-gray-400 mb-2">
                        Booking ID
                      </div>
                      <p className="text-gray-300 font-mono text-xs mb-4 break-all">
                        {booking._id}
                      </p>

                      <div className="text-2xl font-bold text-cyan-400">
                        ₹{booking.totalPrice}
                      </div>
                      <p className="text-xs text-gray-400">
                        Booked on {formatBookingDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="border-t border-gray-600 px-6 py-3 flex gap-3">
                  <button
                    onClick={() => handleDownloadTicket(booking, index)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Ticket
                  </button>
                  <button
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === booking._id ? null : booking._id,
                      )
                    }
                    className="flex-1 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-semibold py-2 rounded-lg transition"
                  >
                    {expandedBooking === booking._id
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking._id && (
                  <div className="border-t border-gray-600 px-6 py-4 bg-slate-800/50">
                    <div
                      id={`ticket-${booking._id}`}
                      className="bg-gradient-to-br from-cyan-600 to-blue-600 p-6 rounded-lg text-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold">
                            {booking.movieId.title}
                          </h4>
                          <p className="text-cyan-100">
                            {booking.theatreId.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <Ticket className="w-8 h-8 ml-auto mb-2" />
                          <p className="text-sm font-semibold">Booking ID</p>
                          <p className="text-xs font-mono">
                            {booking._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div className="bg-white/20 p-3 rounded">
                          <p className="text-xs text-cyan-100">Date</p>
                          <p className="font-bold">
                            {formatDate(
                              booking.showtimeId?.date || booking.createdAt,
                            )}
                          </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded">
                          <p className="text-xs text-cyan-100">Time</p>
                          <p className="font-bold">
                            {booking.showtimeId?.time || "TBA"}
                          </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded">
                          <p className="text-xs text-cyan-100">Seats</p>
                          <p className="font-bold">{booking.seats.length}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-cyan-100 mb-1">
                          Seat Numbers
                        </p>
                        <p className="text-lg font-bold">
                          {booking.seats.join(", ")}
                        </p>
                      </div>

                      <div className="border-t border-white/30 pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-cyan-100">Amount</p>
                          <p className="text-2xl font-bold">
                            ₹{booking.totalPrice}
                          </p>
                        </div>
                        <QRCode
                          value={generateQRValue(booking)}
                          size={100}
                          level="H"
                          includeMargin={false}
                          fgColor="#ffffff"
                          bgColor="#06b6d4"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                      ✓ Valid for entry on the show date. Please carry a valid
                      ID.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Confirmed Bookings
            </h3>
            <p className="text-gray-400 mb-6">
              You don't have any confirmed bookings yet. Start booking your
              favorite movies!
            </p>
            <a
              href="/"
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Browse Movies
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
