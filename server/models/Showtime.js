import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Please provide a showtime date"],
    },
    time: {
      type: String,
      required: [true, "Please provide a showtime (e.g., 7:30 PM)"],
    },
    totalSeats: {
      type: Number,
      default: 112, // 8 rows x 14 seats
    },
    availableSeats: {
      type: Number,
      default: 112,
    },
    screen: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true },
);

// Index for faster queries by theatre, screen, and date-time
showtimeSchema.index({ theatreId: 1, screen: 1, date: 1, time: 1 });

export default mongoose.model("Showtime", showtimeSchema);
