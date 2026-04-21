import express from "express";
import Showtime from "../models/Showtime.js";
import Seat from "../models/Seat.js";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireTheatreAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// TEST ENDPOINT - Remove after debugging
router.get("/test/debug", (req, res) => {
  console.log("🧪 TEST ENDPOINT CALLED - Router is working!");
  res
    .status(200)
    .json({ message: "Router is working!", timestamp: new Date() });
});

// Helper function to check if showtime is bookable
const getShowtimeStatus = (showtimeDate, showtimeTime) => {
  const now = new Date();

  // Parse showtime date
  const showtimeDateObj = new Date(showtimeDate);

  // Parse 12-hour format time (e.g., "09:30 AM", "01:30 PM")
  const timeMatch = showtimeTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) {
    return { isPast: true, bookable: false, hoursUntilShowtime: 0 };
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

  showtimeDateObj.setHours(hours, minutes, 0, 0);

  // Calculate time until showtime
  const timeUntilShowtime = showtimeDateObj.getTime() - now.getTime();
  const hoursUntilShowtime = timeUntilShowtime / (1000 * 60 * 60);

  // Showtime is in the past
  if (timeUntilShowtime < 0) {
    return { isPast: true, bookable: false, hoursUntilShowtime };
  }

  // Booking window closed (less than 2 hours until showtime)
  if (hoursUntilShowtime < 2) {
    return {
      isPast: false,
      bookable: false,
      hoursUntilShowtime,
      reason:
        "Booking window closed - must book at least 2 hours before showtime",
    };
  }

  // Showtime is bookable
  return { isPast: false, bookable: true, hoursUntilShowtime };
};

// Helper function to check if showtime conflicts with another on same screen
const checkShowtimeConflict = async (
  theatreId,
  screen,
  date,
  time,
  excludeShowtimeId = null,
) => {
  // Parse the provided time
  const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) {
    return { hasConflict: false };
  }

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  // Create date objects for start and end of showtime window
  // Assuming average movie duration is 2.5 hours, add buffer for cleaning
  const showtimeStart = new Date(date);
  showtimeStart.setHours(hours, minutes, 0, 0);

  const showtimeEnd = new Date(showtimeStart);
  showtimeEnd.setHours(showtimeEnd.getHours() + 3); // 2.5 hour movie + 30 min buffer

  // Find all showtimes on the same screen on the same day
  const showtimeDateStart = new Date(date);
  showtimeDateStart.setHours(0, 0, 0, 0);

  const showtimeDateEnd = new Date(date);
  showtimeDateEnd.setHours(23, 59, 59, 999);

  let query = {
    theatreId,
    screen,
    date: { $gte: showtimeDateStart, $lte: showtimeDateEnd },
  };

  if (excludeShowtimeId) {
    query._id = { $ne: excludeShowtimeId };
  }

  const conflictingShowtimes =
    await Showtime.find(query).select("_id time movieId");

  // Check for time conflicts (overlapping showtimes)
  const conflicts = conflictingShowtimes.filter((existing) => {
    const existingTimeMatch = existing.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!existingTimeMatch) return false;

    let existingHours = parseInt(existingTimeMatch[1]);
    const existingMinutes = parseInt(existingTimeMatch[2]);
    const existingMeridiem = existingTimeMatch[3].toUpperCase();

    if (existingMeridiem === "PM" && existingHours !== 12) {
      existingHours += 12;
    } else if (existingMeridiem === "AM" && existingHours === 12) {
      existingHours = 0;
    }

    const existingStart = new Date(date);
    existingStart.setHours(existingHours, existingMinutes, 0, 0);

    const existingEnd = new Date(existingStart);
    existingEnd.setHours(existingEnd.getHours() + 3);

    // Check for overlap: if new showtime ends after existing starts AND new showtime starts before existing ends
    return showtimeStart < existingEnd && showtimeEnd > existingStart;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};

// Helper function to parse date string correctly (YYYY-MM-DD)
const parseDateString = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to check if a date/time is in the past
const isDateTimePast = (dateStr, timeStr) => {
  const now = new Date();
  const showtimeDate = parseDateString(dateStr);

  // Parse time
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return false;

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  showtimeDate.setHours(hours, minutes, 0, 0);

  return showtimeDate <= now;
};

// GET /api/showtimes - List showtimes for a theatre/movie (today + next 7 days)
router.get("/", async (req, res, next) => {
  try {
    const { theatreId, movieId, date, admin } = req.query;

    if (!theatreId) {
      return res.status(400).json({ message: "Theatre ID required" });
    }

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For admin view, show all dates; for customers, show next 7 days
    const daysToShow = admin ? 30 : 7;
    const endOfRange = new Date(today);
    endOfRange.setDate(endOfRange.getDate() + daysToShow);
    endOfRange.setHours(0, 0, 0, 0);

    let query = { theatreId };
    let requestedDate = null;

    // Show showtimes based on date parameter
    if (date) {
      // Parse date string correctly (YYYY-MM-DD format)
      try {
        requestedDate = parseDateString(date);

        console.log(`📅 Requested date: ${date}`);
        console.log(`📅 Today: ${today.toISOString().split("T")[0]}`);
        console.log(
          `📅 Parsed requested date: ${requestedDate.toISOString().split("T")[0]}`,
        );

        // If requested date is before today (only for non-admin), use today instead
        if (!admin && requestedDate < today) {
          console.log(`⚠️  Requested date is in the past, using today instead`);
          requestedDate = new Date(today);
        }

        // If requested date is beyond the range, still allow it but log warning
        if (requestedDate >= endOfRange && !admin) {
          console.log(
            `⚠️  Requested date is beyond default range, but fetching anyway`,
          );
        }

        const endDate = new Date(requestedDate);
        endDate.setDate(endDate.getDate() + 1);
        query.date = { $gte: requestedDate, $lt: endDate };

        console.log(
          `🔍 Query range: ${requestedDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
        );
      } catch (err) {
        console.error(`❌ Error parsing date: ${date}`, err);
        query.date = { $gte: today, $lt: endOfRange };
      }
    } else {
      // No specific date requested
      if (admin) {
        // Admin: show all showtimes from today onwards
        query.date = { $gte: today };
        console.log(`🔍 Admin view: showing all showtimes from today onwards`);
      } else {
        // Customer: show today + next 6 days
        query.date = { $gte: today, $lt: endOfRange };
        console.log(`🔍 Customer view: showing today + 6 days`);
      }
    }

    if (movieId) query.movieId = movieId;

    let showtimes = await Showtime.find(query)
      .populate("movieId", "title duration rating")
      .sort({ date: 1, screen: 1, time: 1 });

    // Filter out past showtimes and add bookable status to each
    console.log(`🔍 Processing ${showtimes.length} showtimes from database`);

    showtimes = showtimes.map((showtime) => {
      const status = getShowtimeStatus(showtime.date, showtime.time);
      const showtimeObj = showtime.toObject();
      showtimeObj.bookable = status.bookable;
      showtimeObj.isPast = status.isPast;
      showtimeObj.bookingClosedReason = status.reason;

      console.log(
        `  📺 Screen ${showtime.screen} - ${showtime.time}: bookable=${status.bookable}, isPast=${status.isPast}`,
      );
      return showtimeObj;
    });

    // For customer view, filter out past showtimes
    // For admin view, keep all showtimes including past ones
    if (!admin) {
      showtimes = showtimes.filter((showtime) => !showtime.isPast);
    }

    console.log(
      `✅ Returning ${showtimes.length} showtimes with bookable status`,
    );
    res.status(200).json({ data: showtimes });
  } catch (error) {
    next(error);
  }
});

// GET /api/showtimes/:id - Get single showtime
router.get("/:id", async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.status(200).json({ data: showtime });
  } catch (error) {
    next(error);
  }
});

// GET /api/showtimes/:id/seats - Get seats for showtime
router.get("/:id/seats", async (req, res, next) => {
  try {
    const seats = await Seat.find({ showtimeId: req.params.id }).select(
      "seatId row number type status lockedBy",
    );

    if (!seats.length) {
      return res.status(404).json({ message: "No seats found" });
    }

    res.status(200).json({ data: seats });
  } catch (error) {
    next(error);
  }
});

// POST /api/showtimes - Create showtime (theatre admin only)
router.post(
  "/",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const { movieId, date, time, screen } = req.body;

      // Validation
      if (!movieId || !date || !time || screen === undefined) {
        return res.status(400).json({
          message: "Please provide movieId, date, time, and screen",
        });
      }

      // Check if date/time is in the past
      if (isDateTimePast(date, time)) {
        return res.status(400).json({
          message: "Cannot create showtime for a past date or time",
        });
      }

      // Verify theatre and get numberOfScreens
      const theatre = await Theatre.findById(req.user.theatreId);

      if (!theatre) {
        return res.status(404).json({ message: "Theatre not found" });
      }

      // Validate screen number
      if (screen < 1 || screen > theatre.numberOfScreens) {
        return res.status(400).json({
          message: `Screen number must be between 1 and ${theatre.numberOfScreens}`,
        });
      }

      // Verify movie belongs to this theatre
      const movie = await Movie.findById(movieId);
      if (!movie || movie.theatreId.toString() !== req.user.theatreId) {
        return res
          .status(403)
          .json({ message: "Movie not found in your theatre" });
      }

      // Check for conflicts on the same screen
      const conflictCheck = await checkShowtimeConflict(
        req.user.theatreId,
        screen,
        date,
        time,
      );

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          message:
            "This time slot conflicts with another showtime on the same screen",
          conflicts: conflictCheck.conflicts.map((s) => ({
            id: s._id,
            time: s.time,
          })),
        });
      }

      // Create showtime
      const showtime = new Showtime({
        theatreId: req.user.theatreId,
        movieId,
        date,
        time,
        screen,
        totalSeats: 112, // Default 8x14
        availableSeats: 112,
      });

      await showtime.save();

      // Auto-generate seats
      const seatsData = [];
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seatsPerRow = 14;
      const vipRows = ["A", "B"];

      for (const row of rows) {
        for (let i = 1; i <= seatsPerRow; i++) {
          seatsData.push({
            theatreId: req.user.theatreId,
            showtimeId: showtime._id,
            seatId: `${row}-${i}`,
            row,
            number: i,
            type: vipRows.includes(row) ? "vip" : "standard",
          });
        }
      }

      await Seat.insertMany(seatsData);

      res.status(201).json({
        message: "Showtime created with seats",
        data: showtime,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/showtimes/:id - Update showtime (theatre admin only)
router.put(
  "/:id",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const showtime = await Showtime.findById(req.params.id);

      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      // Verify theatre admin owns this showtime
      if (showtime.theatreId.toString() !== req.user.theatreId) {
        return res
          .status(403)
          .json({ message: "Can only update showtimes in your theatre" });
      }

      const { movieId, date, time, screen } = req.body;

      // Check if date/time is being updated to a past date/time
      if (date || time) {
        const checkDate = date || showtime.date;
        const checkTime = time || showtime.time;
        if (isDateTimePast(checkDate, checkTime)) {
          return res.status(400).json({
            message: "Cannot set showtime to a past date or time",
          });
        }
      }

      // If updating screen/date/time, check for conflicts
      if (
        (screen !== undefined && screen !== showtime.screen) ||
        date ||
        time
      ) {
        const newScreen = screen !== undefined ? screen : showtime.screen;
        const newDate = date || showtime.date;
        const newTime = time || showtime.time;

        // Verify theatre and get numberOfScreens
        const theatre = await Theatre.findById(req.user.theatreId);

        if (!theatre) {
          return res.status(404).json({ message: "Theatre not found" });
        }

        // Validate screen number
        if (newScreen < 1 || newScreen > theatre.numberOfScreens) {
          return res.status(400).json({
            message: `Screen number must be between 1 and ${theatre.numberOfScreens}`,
          });
        }

        // Check for conflicts (exclude current showtime)
        const conflictCheck = await checkShowtimeConflict(
          req.user.theatreId,
          newScreen,
          newDate,
          newTime,
          req.params.id,
        );

        if (conflictCheck.hasConflict) {
          return res.status(409).json({
            message:
              "This time slot conflicts with another showtime on the same screen",
            conflicts: conflictCheck.conflicts.map((s) => ({
              id: s._id,
              time: s.time,
            })),
          });
        }
      }

      if (movieId) showtime.movieId = movieId;
      if (date) showtime.date = date;
      if (time) showtime.time = time;
      if (screen !== undefined) showtime.screen = screen;

      await showtime.save();

      res.status(200).json({
        message: "Showtime updated",
        data: showtime,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/showtimes/:id - Delete showtime (theatre admin only)
router.delete(
  "/:id",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const showtime = await Showtime.findById(req.params.id);

      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      // Verify theatre admin owns this showtime
      if (showtime.theatreId.toString() !== req.user.theatreId) {
        return res
          .status(403)
          .json({ message: "Can only delete showtimes in your theatre" });
      }

      await Showtime.deleteOne({ _id: req.params.id });
      await Seat.deleteMany({ showtimeId: req.params.id });

      res.status(200).json({
        message: "Showtime deleted with all seats",
        data: showtime,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
