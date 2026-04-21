import Seat from "../models/Seat.js";

/**
 * Socket.io handlers for real-time seat locking/unlocking
 * Manages concurrent seat selection across all connected clients for a showtime
 */
export const initializeSeatLocking = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * Join a showtime room for real-time seat updates
     * Event: client emits "join-showtime" with { showtimeId, userId }
     */
    socket.on("join-showtime", ({ showtimeId, userId }) => {
      const roomId = `showtime-${showtimeId}`;
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Notify others that a new user is viewing this showtime
      socket.to(roomId).emit("user-joined", {
        userId,
        timestamp: new Date(),
      });
    });

    /**
     * Lock seats temporarily for this user (5 minute TTL)
     * Event: client emits "lock-seats" with { showtimeId, seatIds, userId }
     */
    socket.on("lock-seats", async ({ showtimeId, seatIds, userId }) => {
      try {
        const roomId = `showtime-${showtimeId}`;
        const lockedAt = new Date();
        const expireAt = new Date(lockedAt.getTime() + 5 * 60 * 1000); // 5 minutes

        // Update all seats to locked status
        await Seat.updateMany(
          {
            showtimeId,
            seatId: { $in: seatIds },
          },
          {
            status: "locked",
            lockedBy: userId,
            lockedAt: lockedAt,
          },
        );

        // Broadcast to all users in this showtime room
        io.to(roomId).emit("seats-locked", {
          seatIds,
          lockedBy: userId,
          expiresIn: 300, // seconds
          timestamp: lockedAt,
        });

        console.log(`Seats locked for user ${userId}: ${seatIds.join(", ")}`);
      } catch (error) {
        socket.emit("lock-error", {
          message: "Failed to lock seats",
          error: error.message,
        });
      }
    });

    /**
     * Unlock seats when user deselects or cancels
     * Event: client emits "unlock-seats" with { showtimeId, seatIds, userId }
     */
    socket.on("unlock-seats", async ({ showtimeId, seatIds, userId }) => {
      try {
        const roomId = `showtime-${showtimeId}`;

        // Update seats back to available (unless already booked)
        await Seat.updateMany(
          {
            showtimeId,
            seatId: { $in: seatIds },
            status: "locked",
            lockedBy: userId,
          },
          {
            status: "available",
            lockedBy: null,
            lockedAt: null,
          },
        );

        // Broadcast unlock to all users in this showtime
        io.to(roomId).emit("seats-unlocked", {
          seatIds,
          unlockedBy: userId,
          timestamp: new Date(),
        });

        console.log(`Seats unlocked for user ${userId}: ${seatIds.join(", ")}`);
      } catch (error) {
        socket.emit("unlock-error", {
          message: "Failed to unlock seats",
          error: error.message,
        });
      }
    });

    /**
     * Confirm booking - marks seats as permanently booked
     * Event: client emits "confirm-booking" with { showtimeId, seatIds, bookingId }
     */
    socket.on("confirm-booking", async ({ showtimeId, seatIds, bookingId }) => {
      try {
        const roomId = `showtime-${showtimeId}`;

        // Mark seats as booked
        await Seat.updateMany(
          {
            showtimeId,
            seatId: { $in: seatIds },
          },
          {
            status: "booked",
            bookedBy: bookingId,
            lockedBy: null,
            lockedAt: null,
          },
        );

        // Broadcast booking confirmation to all users
        io.to(roomId).emit("seats-booked", {
          seatIds,
          bookingId,
          timestamp: new Date(),
        });

        console.log(
          `Seats booked for booking ${bookingId}: ${seatIds.join(", ")}`,
        );
      } catch (error) {
        socket.emit("booking-error", {
          message: "Failed to confirm booking",
          error: error.message,
        });
      }
    });

    /**
     * Leave showtime room
     */
    socket.on("leave-showtime", ({ showtimeId, userId }) => {
      const roomId = `showtime-${showtimeId}`;
      socket.leave(roomId);
      console.log(`User ${userId} left room ${roomId}`);

      // Notify others
      socket.to(roomId).emit("user-left", {
        userId,
        timestamp: new Date(),
      });
    });

    /**
     * Handle disconnection - cleanup
     */
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
