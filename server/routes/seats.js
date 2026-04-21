import express from "express";
import Seat from "../models/Seat.js";
import Showtime from "../models/Showtime.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/seats/showtime/:showtimeId - Get all seats for a showtime
router.get("/showtime/:showtimeId", authMiddleware, async (req, res, next) => {
  try {
    const { showtimeId } = req.params;

    // Verify showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Fetch all seats for this showtime
    const seats = await Seat.find({
      showtimeId,
    }).select("seatId row column type status lockedBy lockedAt bookedBy");

    // Format response
    const formattedSeats = seats.map((seat) => ({
      _id: seat._id,
      seatId: seat.seatId,
      row: seat.row,
      column: seat.column,
      type: seat.type,
      status: seat.status,
      isLocked: seat.status === "locked",
      isBooked: seat.status === "booked",
      lockedBy: seat.lockedBy,
      lockedAt: seat.lockedAt,
      bookedBy: seat.bookedBy,
    }));

    res.status(200).json({
      data: formattedSeats,
      total: formattedSeats.length,
      available: formattedSeats.filter((s) => s.status === "available").length,
      booked: formattedSeats.filter((s) => s.status === "booked").length,
      locked: formattedSeats.filter((s) => s.status === "locked").length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/seats/lock - Lock seats (for real-time booking)
router.post("/lock", authMiddleware, async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const customerId = req.user.userId;

    if (!showtimeId || !seatIds || seatIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Showtime ID and seat IDs required" });
    }

    // Check if seats are available
    const seats = await Seat.find({
      showtimeId,
      seatId: { $in: seatIds },
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: "Some seats not found" });
    }

    const unavailableSeats = seats.filter(
      (s) =>
        s.status === "booked" ||
        (s.status === "locked" && s.lockedBy.toString() !== customerId),
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        message: "Some seats are no longer available",
        unavailableSeats: unavailableSeats.map((s) => s.seatId),
      });
    }

    // Lock the seats
    await Seat.updateMany(
      { showtimeId, seatId: { $in: seatIds } },
      {
        status: "locked",
        lockedBy: customerId,
        lockedAt: new Date(),
      },
    );

    res.status(200).json({
      message: "Seats locked successfully",
      lockedSeats: seatIds,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/seats/unlock - Unlock seats (on timeout or user cancellation)
router.post("/unlock", authMiddleware, async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const customerId = req.user.userId;

    if (!showtimeId || !seatIds || seatIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Showtime ID and seat IDs required" });
    }

    // Unlock only if locked by the same user
    const result = await Seat.updateMany(
      {
        showtimeId,
        seatId: { $in: seatIds },
        status: "locked",
        lockedBy: customerId,
      },
      {
        status: "available",
        lockedBy: null,
        lockedAt: null,
      },
    );

    res.status(200).json({
      message: "Seats unlocked successfully",
      unlockedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/seats/:showtimeId - Alternative endpoint for getting seats
router.get("/:showtimeId", authMiddleware, async (req, res, next) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const seats = await Seat.find({ showtimeId }).select(
      "seatId row column type status lockedBy lockedAt bookedBy",
    );

    res.status(200).json({ data: seats });
  } catch (error) {
    next(error);
  }
});

export default router;
