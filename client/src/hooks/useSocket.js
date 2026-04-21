import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";

/**
 * useSocket Hook - Real-time seat locking via Socket.io
 * Manages WebSocket connection and seat state synchronization
 */
export const useSocket = (showtimeId) => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const [lockedSeats, setLockedSeats] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!showtimeId || !user?.id) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Join the showtime room
    socket.emit("join-showtime", {
      showtimeId,
      userId: user.id,
    });

    // Listen for seat lock events
    socket.on("seats-locked", ({ seatIds, lockedBy, expiresIn }) => {
      setLockedSeats((prev) => {
        const updated = { ...prev };
        seatIds.forEach((seatId) => {
          updated[seatId] = {
            lockedBy,
            expiresIn,
          };
        });
        return updated;
      });
    });

    // Listen for seat unlock events
    socket.on("seats-unlocked", ({ seatIds }) => {
      setLockedSeats((prev) => {
        const updated = { ...prev };
        seatIds.forEach((seatId) => {
          delete updated[seatId];
        });
        return updated;
      });
    });

    // Listen for booking confirmation
    socket.on("seats-booked", ({ seatIds, bookingId }) => {
      setBookedSeats((prev) => [...prev, ...seatIds]);
      setLockedSeats((prev) => {
        const updated = { ...prev };
        seatIds.forEach((seatId) => {
          delete updated[seatId];
        });
        return updated;
      });
    });

    // Listen for user join/leave
    socket.on("user-joined", ({ userId }) => {
      setConnectedUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("user-left", ({ userId }) => {
      setConnectedUsers((prev) => prev.filter((id) => id !== userId));
    });

    // Handle errors
    socket.on("lock-error", ({ message }) => {
      console.error("Seat lock error:", message);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.connected) {
        socket.emit("leave-showtime", { showtimeId, userId: user.id });
        socket.disconnect();
      }
    };
  }, [showtimeId, user?.id]);

  // Lock seats function
  const lockSeats = useCallback(
    (seatIds) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("lock-seats", {
          showtimeId,
          seatIds,
          userId: user?.id,
        });
      }
    },
    [showtimeId, user?.id],
  );

  // Unlock seats function
  const unlockSeats = useCallback(
    (seatIds) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("unlock-seats", {
          showtimeId,
          seatIds,
          userId: user?.id,
        });
      }
    },
    [showtimeId, user?.id],
  );

  // Confirm booking function
  const confirmBooking = useCallback(
    (seatIds, bookingId) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("confirm-booking", {
          showtimeId,
          seatIds,
          bookingId,
        });
      }
    },
    [showtimeId],
  );

  return {
    lockedSeats,
    bookedSeats,
    connectedUsers,
    lockSeats,
    unlockSeats,
    confirmBooking,
  };
};
