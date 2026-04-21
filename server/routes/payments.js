import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import authMiddleware from "../middleware/authMiddleware.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Theatre from "../models/Theatre.js";
import Movie from "../models/Movie.js";
import Showtime from "../models/Showtime.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";

const router = express.Router();

// Helper function to get Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create Razorpay order for booking
router.post("/create-order", authMiddleware, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.userId;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("movieId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify booking belongs to user
    if (booking.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if payment already exists and is captured
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment && existingPayment.status === "captured") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Create Razorpay order
    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: Math.round(booking.totalPrice * 100), // Razorpay uses paise (1/100th of rupee)
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        theatreId: booking.theatreId.toString(),
        movieId: booking.movieId._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save or update payment record
    let payment = await Payment.findOne({ bookingId });
    if (!payment) {
      payment = new Payment({
        bookingId,
        customerId: userId,
        amount: booking.totalPrice,
        razorpayOrderId: razorpayOrder.id,
      });
    } else {
      payment.razorpayOrderId = razorpayOrder.id;
      payment.status = "created";
    }

    await payment.save();

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.json({
      orderId: razorpayOrder.id,
      amount: booking.totalPrice,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId,
      movieTitle: booking.movieId.title,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    next(error);
  }
});

// Verify payment signature and confirm booking
router.post("/verify", authMiddleware, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } =
      req.body;
    const userId = req.user.userId;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Verify payment belongs to user
    if (payment.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ Signature mismatch:", {
        expected: expectedSignature,
        received: razorpaySignature,
      });
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Fetch payment details from Razorpay to verify status
    const razorpay = getRazorpayInstance();
    const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

    if (paymentDetails.status !== "captured") {
      return res
        .status(400)
        .json({ message: "Payment not captured by Razorpay" });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "captured";
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.bookingId)
      .populate("customerId")
      .populate("movieId")
      .populate("showtimeId")
      .populate("theatreId");

    booking.status = "confirmed";
    booking.paymentId = razorpayPaymentId;
    await booking.save();

    console.log("✅ Payment verified and booking confirmed:", {
      bookingId: booking._id,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });

    // Send booking confirmation email
    try {
      const customer = booking.customerId;
      const movie = booking.movieId;
      const theatre = booking.theatreId;
      const showtime = booking.showtimeId;

      const showtimeString = showtime
        ? `${new Date(showtime.date).toLocaleDateString()} at ${showtime.time}`
        : "N/A";
      const seatsString = booking.seats.join(", ");
      const screenNumber = showtime ? showtime.screen : "N/A";

      await sendBookingConfirmationEmail(
        customer.email,
        customer.name,
        movie.title,
        theatre.name,
        showtimeString,
        seatsString,
        booking._id.toString(),
        booking.totalPrice,
        screenNumber,
      );

      console.log(`✅ Booking confirmation email sent to ${customer.email}`);
    } catch (emailError) {
      console.error(
        "❌ Failed to send booking confirmation email:",
        emailError,
      );
      // Don't fail the payment process if email fails
    }

    res.json({
      message: "Payment verified successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    next(error);
  }
});

// Get payment status
router.get("/:bookingId", authMiddleware, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
