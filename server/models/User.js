import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      match: [
        /^[+]91[-]?[6-9][0-9]{9}$/,
        "Please provide a valid Indian phone number (format: +91XXXXXXXXXX)",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["superadmin", "theatreAdmin", "customer"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      default: null, // Only populated for theatreAdmin
    },
    theatreName: {
      type: String,
      default: null, // Only for theatreAdmin
    },
    city: {
      type: String,
      default: null, // Only for theatreAdmin
    },
    screens: {
      type: Number,
      default: null, // Optional for theatreAdmin
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
