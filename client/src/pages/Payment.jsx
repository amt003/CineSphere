import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Loader } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setBooking(data.data);
        } else if (response.status === 404) {
          showError("Booking not found");
        } else {
          showError("Failed to load booking details");
        }
      } catch (err) {
        showError("Error loading booking. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  // Initialize Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!booking || !window.Razorpay) {
      showError("Payment gateway not available");
      return;
    }

    setProcessing(true);

    try {
      // Create Razorpay order
      const token = localStorage.getItem("accessToken");
      const orderResponse = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: booking._id || bookingId,
          }),
        },
      );

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "CineSphere",
        description: `Booking for ${orderData.movieTitle}`,
        image: "https://via.placeholder.com/100",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        handler: async (response) => {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch(
              "http://localhost:5000/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  bookingId: booking._id || bookingId,
                  razorpayOrderId: orderData.orderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
              // Payment successful - redirect to tickets page
              success("Payment completed! Redirecting to your tickets...");
              setTimeout(() => {
                navigate(`/tickets`, {
                  state: { bookingConfirmed: booking._id || bookingId },
                });
              }, 1500);
            } else {
              showError(verifyData.message || "Payment verification failed");
              setProcessing(false);
            }
          } catch (err) {
            showError("Error verifying payment. Please contact support.");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showError(err.message || "Payment failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader className="animate-spin" size={40} />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <AlertCircle className="text-red-500" />
            <span>{error || "Booking not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

          {/* Booking Details */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">
              Booking Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono text-sm">{booking._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seats:</span>
                <span>{booking.seats?.join(", ") || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Number of Seats:</span>
                <span>{booking.seats?.length || 0} seat(s)</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">
              Price Summary
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-slate-300">
                <span>Price Per Seat:</span>
                <span>
                  ₹
                  {Math.round(
                    booking.totalPrice / (booking.seats?.length || 1),
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Number of Seats:</span>
                <span>{booking.seats?.length || 0}</span>
              </div>
            </div>
            <div className="border-t border-slate-600 pt-4">
              <div className="flex justify-between text-xl font-bold text-cyan-400">
                <span>Total Amount:</span>
                <span>₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">
              Payment Method
            </h2>
            <p className="text-slate-400 mb-4">
              You will be redirected to Razorpay to complete your payment
              securely.
            </p>
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded">
              <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">
                  Razorpay
                </span>
              </div>
              <span>Secure Payment Gateway</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>Pay ₹{booking.totalPrice} Now</>
            )}
          </button>

          <p className="text-center text-slate-400 text-sm mt-4">
            By clicking "Pay Now", you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
