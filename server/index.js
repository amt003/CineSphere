import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import theatreRoutes from "./routes/theatres.js";
import movieRoutes from "./routes/movies.js";
import showtimeRoutes from "./routes/showtimes.js";
import seatRoutes from "./routes/seats.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import superadminRoutes from "./routes/superadmin.js";
import { initializeSeatLocking } from "./socket/seatLock.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use("/uploads", express.static("uploads"));

// CORS Configuration - accept both 5173 and 5174 for dev
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/superadmin/movies", superadminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "CineSphere server is running 🎬" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server with Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.io handlers for real-time seat locking
initializeSeatLocking(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🎬 CineSphere Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ${process.env.CLIENT_URL}`);
  console.log(`⚡ Socket.io WebSocket enabled for real-time seat locking`);
  console.log(`🗄️  MongoDB connected\n`);
});
