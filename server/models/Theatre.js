import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide theatre name"],
      trim: true,
      maxlength: [100, "Theatre name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Please provide location"],
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    hallLayout: {
      rows: {
        type: Number,
        default: 8,
        min: 1,
        max: 26, // A-Z
      },
      seatsPerRow: {
        type: Number,
        default: 14,
        min: 1,
      },
      vipRows: {
        type: [String],
        default: ["A", "B"],
      },
      aisleAfterSeat: {
        type: [Number],
        default: [3, 10],
      },
    },
    pricing: {
      standard: {
        type: Number,
        required: true,
        default: 150,
      },
      vip: {
        type: Number,
        required: true,
        default: 250,
      },
    },
    numberOfScreens: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Set when super admin approves
    },
    approvalDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Theatre", theatreSchema);
