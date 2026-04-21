import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: false,
    },
    title: {
      type: String,
      required: [true, "Please provide a movie title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    posterUrl: {
      type: String,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number,
      required: [true, "Please provide duration in minutes"],
      min: [30, "Duration must be at least 30 minutes"],
    },
    language: {
      type: String,
      default: "English",
    },
    rating: {
      type: String,
      enum: ["U", "UA", "A", "S"],
      default: "UA",
    },
    director: {
      type: String,
      required: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    showtimes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Showtime",
      },
    ],
  },
  { timestamps: true },
);

// Compound unique index for title per theatre
movieSchema.index({ theatreId: 1, title: 1 }, { unique: true });

export default mongoose.model("Movie", movieSchema);
