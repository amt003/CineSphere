import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "captured", "failed", "refunded"],
      default: "created",
    },
    method: {
      type: String,
      default: "razorpay",
    },
  },
  { timestamps: true },
);

// Index for queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

export default mongoose.model("Payment", paymentSchema);
