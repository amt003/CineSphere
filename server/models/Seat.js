import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seatId: {
      type: String,
      required: true, // e.g., 'A-5'
    },
    row: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["vip", "standard"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["available", "locked", "booked"],
      default: "available",
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 300 }, // Auto-release after 5 minutes
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for unique seat per showtime
seatSchema.index({ showtimeId: 1, seatId: 1 }, { unique: true });
// Index for theatre queries
seatSchema.index({ theatreId: 1, showtimeId: 1 });

export default mongoose.model("Seat", seatSchema);
