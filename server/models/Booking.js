import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: {
      type: [String],
      required: [true, "Please select at least one seat"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one seat must be selected",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Index for theatre queries
bookingSchema.index({ theatreId: 1, customerId: 1 });
bookingSchema.index({ theatreId: 1, showtimeId: 1 });

export default mongoose.model("Booking", bookingSchema);
