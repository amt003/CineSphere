import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import authMiddleware from "../middleware/authMiddleware.js";
import Movie from "../models/Movie.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = "uploads/posters";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(
      file.originalname,
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, JPEG formats are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Require super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Only super admin can access this" });
  }
  next();
};

// GET /api/superadmin/movies - Get all featured movies (public access)
router.get("/", async (req, res, next) => {
  try {
    const movies = await Movie.find({})
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Featured movies",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/superadmin/movies - Create new featured movie
router.post(
  "/",
  authMiddleware,
  requireSuperAdmin,
  upload.single("poster"),
  async (req, res, next) => {
    try {
      const {
        title,
        description,
        genre,
        duration,
        language,
        rating,
        director,
        cast,
        releaseDate,
        isFeatured,
      } = req.body;

      // Validate required fields
      if (!title || !description || !duration || !director || !releaseDate) {
        if (req.file) {
          fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(400).json({
          message:
            "Title, description, duration, director, and releaseDate are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Poster image is required" });
      }

      // Create movie with generated theatreId (system-wide movie)
      const posterUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/posters/${
        req.file.filename
      }`;

      const movie = new Movie({
        theatreId: null, // System-wide movie
        title: title.trim(),
        description: description.trim(),
        posterUrl,
        genre: Array.isArray(genre)
          ? genre
          : genre.split(",").map((g) => g.trim()),
        duration: parseInt(duration),
        language: language || "English",
        rating: rating || "UA",
        director: director.trim(),
        cast: Array.isArray(cast)
          ? cast
          : cast
            ? cast.split(",").map((c) => c.trim())
            : [],
        releaseDate: new Date(releaseDate),
        isFeatured: isFeatured === "true" || isFeatured === true,
      });

      await movie.save();

      res.status(201).json({
        message: "Movie created successfully",
        data: movie,
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      next(error);
    }
  },
);

// PUT /api/superadmin/movies/:id - Update featured movie
router.put(
  "/:id",
  authMiddleware,
  requireSuperAdmin,
  upload.single("poster"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        genre,
        duration,
        language,
        rating,
        director,
        cast,
        releaseDate,
        isFeatured,
      } = req.body;

      const movie = await Movie.findById(id);
      if (!movie) {
        if (req.file) {
          fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(404).json({ message: "Movie not found" });
      }

      // Update fields
      if (title) movie.title = title.trim();
      if (description) movie.description = description.trim();
      if (genre)
        movie.genre = Array.isArray(genre)
          ? genre
          : genre.split(",").map((g) => g.trim());
      if (duration) movie.duration = parseInt(duration);
      if (language) movie.language = language;
      if (rating) movie.rating = rating;
      if (director) movie.director = director.trim();
      if (cast)
        movie.cast = Array.isArray(cast)
          ? cast
          : cast.split(",").map((c) => c.trim());
      if (releaseDate) movie.releaseDate = new Date(releaseDate);
      movie.isFeatured = isFeatured === "true" || isFeatured === true;

      // Handle new poster
      if (req.file) {
        const oldFile = movie.posterUrl.split("/").pop();
        fs.unlink(`${uploadDir}/${oldFile}`, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });

        movie.posterUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/posters/${
          req.file.filename
        }`;
      }

      await movie.save();

      res.status(200).json({
        message: "Movie updated successfully",
        data: movie,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      next(error);
    }
  },
);

// DELETE /api/superadmin/movies/:id - Delete featured movie
router.delete(
  "/:id",
  authMiddleware,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const movie = await Movie.findByIdAndDelete(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Delete poster file
      const file = movie.posterUrl.split("/").pop();
      fs.unlink(`${uploadDir}/${file}`, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      res.status(200).json({
        message: "Movie deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
