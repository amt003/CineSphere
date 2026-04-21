import express from "express";
import Theatre from "../models/Theatre.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Showtime from "../models/Showtime.js";
import Booking from "../models/Booking.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendTheatreApprovalEmail,
  sendTheatreRejectionEmail,
} from "../services/emailService.js";
import {
  requireSuperAdmin,
  requireTheatreAdmin,
  requireRole,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET /api/theatres - List all active theatres (public)
router.get("/", async (req, res, next) => {
  try {
    const theatres = await Theatre.find({ status: "active" })
      .populate("adminId", "name email")
      .select("-approvedBy");

    res.status(200).json({ data: theatres });
  } catch (error) {
    next(error);
  }
});

// GET /api/theatres/pending/all - Get all pending theatres (super admin only)
router.get(
  "/pending/all",
  authMiddleware,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const pendingTheatres = await Theatre.find({ status: "pending" })
        .populate("adminId", "name email phone")
        .sort({ createdAt: -1 });

      const stats = {
        total: await Theatre.countDocuments(),
        pending: await Theatre.countDocuments({ status: "pending" }),
        active: await Theatre.countDocuments({ status: "active" }),
        suspended: await Theatre.countDocuments({ status: "suspended" }),
      };

      res.status(200).json({
        message: "Pending theatres",
        data: pendingTheatres,
        count: pendingTheatres.length,
        stats,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/theatres/approval/all - Get all theatres with approval status (super admin only)
router.get(
  "/approval/all",
  authMiddleware,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { status: filterStatus } = req.query;

      const query = filterStatus ? { status: filterStatus } : {};
      const theatres = await Theatre.find(query)
        .populate("adminId", "name email phone")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });

      const stats = {
        total: await Theatre.countDocuments(),
        pending: await Theatre.countDocuments({ status: "pending" }),
        active: await Theatre.countDocuments({ status: "active" }),
        suspended: await Theatre.countDocuments({ status: "suspended" }),
      };

      res.status(200).json({
        message: "Theatre approval overview",
        data: theatres,
        stats,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/theatres/:id - Get single theatre details (public)
router.get("/:id", async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id)
      .populate("adminId", "name email")
      .select("-approvedBy");

    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found" });
    }

    res.status(200).json({ data: theatre });
  } catch (error) {
    next(error);
  }
});

// POST /api/theatres - Create theatre (handled in auth register, but allow super admin to create)
router.post("/", authMiddleware, requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, location, adminId } = req.body;

    if (!name || !location || !adminId) {
      return res
        .status(400)
        .json({ message: "Name, location, and adminId are required" });
    }

    const theatre = new Theatre({
      name,
      location,
      adminId,
      status: "pending",
    });

    await theatre.save();

    res.status(201).json({
      message: "Theatre created successfully",
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/theatres/:id - Update theatre (theatre admin of own theatre only)
router.put(
  "/:id",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const theatre = await Theatre.findById(req.params.id);

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      // Verify this is the theatre admin's own theatre
      if (theatre.adminId.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Can only update your own theatre" });
      }

      const { name, location, hallLayout, pricing } = req.body;

      if (name) theatre.name = name;
      if (location) theatre.location = location;
      if (hallLayout)
        theatre.hallLayout = { ...theatre.hallLayout, ...hallLayout };
      if (pricing) theatre.pricing = pricing;

      await theatre.save();

      res.status(200).json({
        message: "Theatre updated successfully",
        data: theatre,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/theatres/:id/status - Change theatre status (super admin only)
router.patch(
  "/:id/status",
  authMiddleware,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["active", "suspended", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const theatre = await Theatre.findByIdAndUpdate(
        req.params.id,
        {
          status,
          approvedBy: req.user.userId,
          approvalDate: new Date(),
        },
        { new: true },
      ).populate("adminId", "name email");

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      // Also update the theatre admin user status to match theatre status
      await User.findByIdAndUpdate(
        theatre.adminId._id,
        { status },
        { new: true },
      );

      // Send approval/rejection emails (non-blocking)
      if (status === "active") {
        sendTheatreApprovalEmail(
          theatre.adminId.email,
          theatre.name,
          theatre.adminId.name,
        ).catch((err) => console.error("Email send error:", err.message));
      } else if (status === "suspended") {
        sendTheatreRejectionEmail(
          theatre.adminId.email,
          theatre.name,
          theatre.adminId.name,
          "Your application did not meet our requirements. Please contact support for more details.",
        ).catch((err) => console.error("Email send error:", err.message));
      }

      res.status(200).json({
        message: "Theatre status updated",
        data: theatre,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/theatres/:id - Delete theatre (super admin only)
router.delete(
  "/:id",
  authMiddleware,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const theatre = await Theatre.findByIdAndDelete(req.params.id);

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      res.status(200).json({
        message: "Theatre deleted successfully",
        data: theatre,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/theatres/:id/dashboard - Get theatre analytics (theatre admin only)
router.get(
  "/:id/dashboard",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const theatre = await Theatre.findById(req.params.id);

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      // Verify this is the theatre admin's own theatre
      if (theatre.adminId.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Can only view your own theatre dashboard" });
      }

      // Get total movies for this theatre
      const totalMovies = await Movie.countDocuments({
        theatreId: req.params.id,
      });

      // Get total showtimes for this theatre
      const totalShowtimes = await Showtime.countDocuments({
        theatreId: req.params.id,
      });

      // Get all bookings for showtimes in this theatre
      const showtimes = await Showtime.find({
        theatreId: req.params.id,
      }).select("_id");
      const showtimeIds = showtimes.map((s) => s._id);

      const bookings = await Booking.find({ showtimeId: { $in: showtimeIds } })
        .populate("customerId", "name email phone")
        .populate({
          path: "showtimeId",
          select: "date time screen",
          populate: {
            path: "movieId",
            select: "title",
          },
        })
        .populate("movieId", "title duration rating")
        .sort({ createdAt: -1 });

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0,
      );

      // Get recent bookings (last 10) with all details
      const recentBookings = bookings.slice(0, 10).map((b) => ({
        id: b._id,
        customerName: b.customerId?.name || "Unknown",
        customerEmail: b.customerId?.email || "N/A",
        customerPhone: b.customerId?.phone || "N/A",
        movieTitle: b.movieId?.title || "Unknown",
        screen: b.showtimeId?.screen || "N/A",
        showDate: b.showtimeId?.date
          ? new Date(b.showtimeId.date).toLocaleDateString()
          : "N/A",
        showTime: b.showtimeId?.time || "N/A",
        seats: b.seats || [],
        seatsCount: (b.seats || []).length,
        amount: b.totalPrice,
        status: b.status,
        bookingDate: b.createdAt,
      }));

      res.status(200).json({
        message: "Theatre dashboard",
        data: {
          theatre,
          stats: {
            totalMovies,
            totalShowtimes,
            totalBookings,
            totalRevenue,
          },
          recentBookings,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/theatres/:id/bookings - Get all bookings for theatre (theatre admin only)
router.get(
  "/:id/bookings",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const theatre = await Theatre.findById(req.params.id);

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      // Verify this is the theatre admin's own theatre
      if (theatre.adminId.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Can only view your own theatre bookings" });
      }

      // Get all showtimes for this theatre
      const showtimes = await Showtime.find({
        theatreId: req.params.id,
      }).select("_id");
      const showtimeIds = showtimes.map((s) => s._id);

      // Get all bookings for showtimes in this theatre
      const bookings = await Booking.find({ showtimeId: { $in: showtimeIds } })
        .populate("customerId", "name email phone")
        .populate({
          path: "showtimeId",
          select: "date time screen",
          populate: {
            path: "movieId",
            select: "title",
          },
        })
        .populate("movieId", "title")
        .sort({ createdAt: -1 });

      // Format bookings for frontend
      const formattedBookings = bookings.map((b) => ({
        id: b._id,
        customerName: b.customerId?.name || "Unknown",
        customerEmail: b.customerId?.email || "N/A",
        customerPhone: b.customerId?.phone || "N/A",
        movieTitle: b.movieId?.title || "Unknown",
        screen: b.showtimeId?.screen || "N/A",
        showDate: b.showtimeId?.date
          ? new Date(b.showtimeId.date).toLocaleDateString()
          : "N/A",
        showTime: b.showtimeId?.time || "N/A",
        seats: b.seats || [],
        seatsCount: (b.seats || []).length,
        amount: b.totalPrice,
        status: b.status,
        bookingDate: b.createdAt,
      }));

      res.status(200).json({
        message: "Theatre bookings",
        data: {
          bookings: formattedBookings,
          count: bookings.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
