import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Theatre from "../models/Theatre.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendCustomerRegistrationEmail,
  sendTheatreRegistrationEmail,
  sendTheatreApprovalEmail,
  sendTheatreRejectionEmail,
} from "../services/emailService.js";

const router = express.Router();

// Helper function to generate tokens with role and theatreId
const generateTokens = (userId, role, theatreId = null) => {
  const payload = { userId, role };
  if (theatreId) {
    payload.theatreId = theatreId;
  }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });

  return { accessToken, refreshToken };
};

// ============================================
// CUSTOMER AUTH ROUTES
// ============================================

// POST /api/auth/register — Customer registration (auto-approved)
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please provide name, email, phone, and password",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({
        message:
          user.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Create customer user
    user = new User({
      name,
      email,
      phone,
      password,
      role: "customer",
      status: "active",
    });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, "customer");

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send registration confirmation email (non-blocking)
    sendCustomerRegistrationEmail(user.email, user.name).catch((err) =>
      console.error("Email send error:", err.message),
    );

    res.status(201).json({
      message: "Registration successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "customer",
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login — Customer login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Check if user exists and is customer
    const user = await User.findOne({ email, role: "customer" })
      .select("+password")
      .populate("theatreId");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, "customer");

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "customer",
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// THEATRE ADMIN AUTH ROUTES
// ============================================

// POST /api/auth/theatre/register — Theatre registration (pending status)
router.post("/theatre/register", async (req, res, next) => {
  try {
    const {
      theatreName,
      ownerName,
      email,
      phone,
      password,
      confirmPassword,
      city,
      screens,
    } = req.body;

    // Validation
    if (!theatreName || !ownerName || !email || !phone || !password || !city) {
      return res.status(400).json({
        message:
          "Please provide theatre name, owner name, email, phone, password, and city",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({
        message:
          user.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Create theatre admin user with PENDING status
    user = new User({
      name: ownerName,
      email,
      phone,
      password,
      role: "theatreAdmin",
      status: "pending",
      theatreName,
      city,
      screens: screens || null,
    });
    await user.save();

    // Create theatre record with PENDING status
    const theatre = new Theatre({
      name: theatreName,
      location: city,
      adminId: user._id,
      status: "pending",
      numberOfScreens: screens ? parseInt(screens) : 1,
    });
    await theatre.save();

    // Update user with theatreId reference
    user.theatreId = theatre._id;
    await user.save();

    // Send theatre registration email (non-blocking)
    sendTheatreRegistrationEmail(user.email, theatreName, ownerName).catch(
      (err) => console.error("Email send error:", err.message),
    );

    res.status(201).json({
      message:
        "Theatre registration submitted. You will receive an email once approved.",
      user: {
        id: user._id,
        email: user.email,
        status: "pending",
        theatreId: theatre._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/theatre/login — Theatre admin login (only if active)
router.post("/theatre/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Check if user exists and is theatre admin
    const user = await User.findOne({ email, role: "theatreAdmin" })
      .select("+password")
      .populate("theatreId");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check status
    if (user.status === "pending") {
      return res.status(403).json({
        message:
          "Your theatre account is pending approval. Please check your email.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your theatre account has been suspended",
      });
    }

    // Generate tokens with theatreId (if theatre exists)
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      "theatreAdmin",
      user.theatreId ? user.theatreId._id : null,
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "theatreAdmin",
        theatreId: user.theatreId ? user.theatreId._id : null,
        status: "active",
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SUPER ADMIN AUTH ROUTES
// ============================================

// POST /api/auth/superadmin/login — Super admin login only
router.post("/superadmin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    console.log("🔍 Super Admin Login Attempt:");
    console.log("  Email:", email);
    console.log("  Password:", password);

    // Check if user exists and is super admin
    const user = await User.findOne({ email, role: "superadmin" }).select(
      "+password",
    );

    console.log("  User Found:", !!user);
    if (user) {
      console.log("  User Details:", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        passwordHash: user.password
          ? user.password.substring(0, 20) + "..."
          : "NO PASSWORD",
      });
    }

    if (!user) {
      console.log("  ❌ No super admin user found with email:", email);
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);
    console.log("  Password Match:", isPasswordCorrect);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    console.log("  ✅ Password correct! Generating tokens...");

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      "superadmin",
    );

    console.log("  ✅ Tokens generated. Saving refresh token...");
    console.log(
      "  Generated Access Token:",
      accessToken.substring(0, 20) + "...",
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    console.log("  ✅ Refresh token saved. Sending response...");

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("  ✅ Cookie set. Responding with 200...");

    const response = {
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "superadmin",
      },
    };

    console.log(
      "  📤 Response object:",
      JSON.stringify(response).substring(0, 100) + "...",
    );
    res.status(200).json(response);

    console.log("  ✅ Response.json() called successfully!");
  } catch (error) {
    console.error("  ❌ ERROR in superadmin/login:", error);
    next(error);
  }
});

// ============================================
// COMMON AUTH ROUTES
// ============================================

// POST /api/auth/refresh — Token refresh (all roles)
router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        theatreId: user.theatreId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY || "15m",
      },
    );

    res.status(200).json({
      message: "Token refreshed",
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout — Logout (all roles)
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
});

export default router;
