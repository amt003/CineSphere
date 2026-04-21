import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Movie from "../models/Movie.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  requireTheatreAdminOrSuper,
  requireTheatreAdmin,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = "uploads/theatre-movies";
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

// GET /api/movies - List all movies for a theatre (public with theatreId query)
router.get("/", async (req, res, next) => {
  try {
    const { theatreId } = req.query;

    if (!theatreId) {
      return res.status(400).json({ message: "Theatre ID required" });
    }

    const movies = await Movie.find({ theatreId, isActive: true });

    res.status(200).json({ data: movies });
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id - Get single movie
router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ data: movie });
  } catch (error) {
    next(error);
  }
});

// POST /api/movies - Create movie (theatre admin only)
router.post(
  "/",
  authMiddleware,
  requireTheatreAdmin,
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
      } = req.body;

      // Validation
      if (
        !title ||
        !description ||
        !genre ||
        !duration ||
        !director ||
        !releaseDate
      ) {
        if (req.file) {
          fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(400).json({
          message: "Please provide all required fields",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Poster image is required" });
      }

      const posterUrl = `/uploads/theatre-movies/${req.file.filename}`;

      // Movie belongs to theatre admin's theatre
      const movie = new Movie({
        theatreId: req.user.theatreId,
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

// PUT /api/movies/:id - Update movie (theatre admin only, own theatre)
router.put(
  "/:id",
  authMiddleware,
  requireTheatreAdmin,
  upload.single("poster"),
  async (req, res, next) => {
    try {
      const movie = await Movie.findById(req.params.id);

      if (!movie) {
        if (req.file) {
          fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(404).json({ message: "Movie not found" });
      }

      // Verify movie belongs to theatre admin's theatre
      if (String(movie.theatreId) !== String(req.user.theatreId)) {
        if (req.file) {
          fs.unlink(`${uploadDir}/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res
          .status(403)
          .json({ message: "Can only update movies in your theatre" });
      }

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
        isActive,
      } = req.body;

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
      if (typeof isActive !== "undefined") movie.isActive = isActive;

      // Handle new poster
      if (req.file) {
        const oldFile = movie.posterUrl.split("/").pop();
        fs.unlink(`${uploadDir}/${oldFile}`, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });

        movie.posterUrl = `/uploads/theatre-movies/${req.file.filename}`;
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

// DELETE /api/movies/:id - Delete movie (theatre admin only, own theatre)
router.delete(
  "/:id",
  authMiddleware,
  requireTheatreAdmin,
  async (req, res, next) => {
    try {
      const movie = await Movie.findById(req.params.id);

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Verify movie belongs to theatre admin's theatre
      if (String(movie.theatreId) !== String(req.user.theatreId)) {
        return res
          .status(403)
          .json({ message: "Can only delete movies in your theatre" });
      }

      // Delete poster file
      const file = movie.posterUrl.split("/").pop();
      fs.unlink(`${uploadDir}/${file}`, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      await Movie.deleteOne({ _id: req.params.id });

      res.status(200).json({
        message: "Movie deleted successfully",
        data: movie,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
