import express from "express";
import Booking from "../models/Booking.js";
import Seat from "../models/Seat.js";
import Showtime from "../models/Showtime.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";
import {
  requireCustomer,
  requireTheatreAdmin,
  requireSuperAdmin,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// POST /api/bookings - Create booking (customer only)
router.post("/", authMiddleware, requireCustomer, async (req, res, next) => {
  try {
    const { theatreId, showtimeId, seats } = req.body;
    const customerId = req.user.userId;

    // Validation
    if (!theatreId || !showtimeId || !seats || seats.length === 0) {
      return res
        .status(400)
        .json({ message: "Theatre ID, showtime ID, and seats required" });
    }

    // Get showtime and verify it belongs to the theatre
    const showtime = await Showtime.findOne({
      _id: showtimeId,
      theatreId,
    }).populate("movieId");

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Check if booking is within 2 hours of showtime
    const now = new Date();

    // Parse 12-hour format time (e.g., "09:30 AM", "01:30 PM")
    const timeMatch = showtime.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      return res.status(400).json({ message: "Invalid showtime format" });
    }

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
      return res.status(400).json({
        message:
          "Booking window closed. You can only book up to 2 hours before the showtime.",
        hoursRemaining: Math.max(0, hoursUntilShowtime),
      });
    }

    // Check seat availability
    const seatDocs = await Seat.find({
      theatreId,
      showtimeId,
      seatId: { $in: seats },
    });

    if (seatDocs.length !== seats.length) {
      return res.status(400).json({ message: "Some seats not found" });
    }

    const unavailableSeats = seatDocs.filter(
      (s) =>
        s.status === "booked" ||
        (s.status === "locked" && s.lockedBy.toString() !== customerId),
    );

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        message: "Some seats are not available",
        unavailableSeats: unavailableSeats.map((s) => s.seatId),
      });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const seat of seatDocs) {
      totalPrice += seat.type === "vip" ? 250 : 150;
    }

    // Create booking
    const booking = new Booking({
      customerId,
      theatreId,
      movieId: showtime.movieId._id,
      showtimeId,
      seats,
      totalPrice,
    });

    await booking.save();

    // Lock the seats
    await Seat.updateMany(
      { theatreId, showtimeId, seatId: { $in: seats } },
      {
        status: "locked",
        lockedBy: customerId,
        lockedAt: new Date(),
      },
    );

    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/my - Get customer's bookings
router.get("/my", authMiddleware, requireCustomer, async (req, res, next) => {
  try {
    const customerId = req.user.userId;

    const bookings = await Booking.find({ customerId })
      .populate("movieId", "title duration rating")
      .populate("theatreId", "name location")
      .populate({
        path: "showtimeId",
        select: "date time theatreId movieId",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ data: bookings });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/theatre - Get theatre's bookings (theatre admin)
router.get(
  "/theatre/:theatreId",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const { theatreId } = req.params;

      // Verify theatre admin owns this theatre
      if (theatreId !== req.user.theatreId) {
        return res
          .status(403)
          .json({ message: "Can only view your own theatre bookings" });
      }

      const bookings = await Booking.find({ theatreId })
        .populate("customerId", "name email phone")
        .populate("movieId", "title")
        .populate("showtimeId", "date time")
        .sort({ createdAt: -1 });

      res.status(200).json({ data: bookings });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/bookings/:id - Get single booking
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("movieId")
      .populate("theatreId")
      .populate("showtimeId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify access: customer can see own booking, theatre admin can see theatre's bookings, super admin can see all
    if (
      req.user.role === "customer" &&
      booking.customerId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "theatreAdmin" &&
      booking.theatreId._id.toString() !== req.user.theatreId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ data: booking });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/bookings/:id/confirm - Confirm booking (theatre admin only)
router.patch(
  "/:id/confirm",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("movieId", "title")
        .populate("theatreId", "name")
        .populate("customerId", "name email")
        .populate("showtimeId", "time date");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify theatre admin owns this booking's theatre
      if (booking.theatreId._id.toString() !== req.user.theatreId) {
        return res
          .status(403)
          .json({ message: "Can only confirm bookings in your theatre" });
      }

      booking.status = "confirmed";
      await booking.save();

      // Mark seats as booked
      await Seat.updateMany(
        { theatreId: booking.theatreId._id, seatId: { $in: booking.seats } },
        {
          status: "booked",
          bookedBy: booking.customerId._id,
          lockedBy: null,
          lockedAt: null,
        },
      );

      // Send booking confirmation email (non-blocking)
      const seatsFormatted = booking.seats.join(", ");
      const showtime = `${booking.showtimeId.date} at ${booking.showtimeId.time}`;

      sendBookingConfirmationEmail(
        booking.customerId.email,
        booking.customerId.name,
        booking.movieId.title,
        booking.theatreId.name,
        showtime,
        seatsFormatted,
        booking._id.toString(),
        booking.totalAmount,
      ).catch((err) => console.error("Email send error:", err.message));

      res.status(200).json({
        message: "Booking confirmed",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/bookings/:id/cancel - Cancel booking
router.patch("/:id/cancel", authMiddleware, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify access
    if (
      req.user.role === "customer" &&
      booking.customerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Can only cancel own bookings" });
    }

    if (
      req.user.role === "theatreAdmin" &&
      booking.theatreId.toString() !== req.user.theatreId
    ) {
      return res
        .status(403)
        .json({ message: "Can only cancel bookings in your theatre" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Release the seats
    await Seat.updateMany(
      { theatreId: booking.theatreId, seatId: { $in: booking.seats } },
      {
        status: "available",
        lockedBy: null,
        bookedBy: null,
        lockedAt: null,
      },
    );

    res.status(200).json({
      message: "Booking cancelled",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
