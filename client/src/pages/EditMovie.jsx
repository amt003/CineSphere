import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, X, Upload } from "lucide-react";

export default function EditMovie() {
  const { movieId } = useParams();
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterFile: null,
    posterUrl: "",
    genre: [],
    duration: "",
    language: "English",
    rating: "UA",
    director: "",
    cast: [],
    releaseDate: "",
    isActive: true,
  });

  const [castInput, setCastInput] = useState("");
  const genreOptions = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Thriller",
    "Animation",
    "Documentary",
  ];

  // Load movie data
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/movies/${movieId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (response.ok) {
          const movie = data.data;
          setFormData({
            title: movie.title,
            description: movie.description,
            posterFile: null,
            posterUrl: movie.posterUrl,
            genre: movie.genre || [],
            duration: movie.duration,
            language: movie.language || "English",
            rating: movie.rating || "UA",
            director: movie.director,
            cast: movie.cast || [],
            releaseDate: movie.releaseDate
              ? new Date(movie.releaseDate).toISOString().split("T")[0]
              : "",
            isActive: movie.isActive,
          });
          setPosterPreview(
            movie.posterUrl.startsWith("/uploads")
              ? `http://localhost:5000${movie.posterUrl}`
              : movie.posterUrl,
          );
        } else if (response.status === 404) {
          showError("Movie not found");
        } else {
          showError("Failed to load movie details");
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        showError("Error loading movie details");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId, showError]);

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showError("Only JPG, PNG, JPEG formats are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("File size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        posterFile: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.duration ||
      !formData.director ||
      !formData.releaseDate ||
      formData.genre.length === 0
    ) {
      showError("Please fill in all required fields");
      return;
    }

    if (parseInt(formData.duration) < 30) {
      showError("Duration must be at least 30 minutes");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.posterFile) {
        formDataToSend.append("poster", formData.posterFile);
      }
      formDataToSend.append("genre", JSON.stringify(formData.genre));
      formDataToSend.append("duration", parseInt(formData.duration));
      formDataToSend.append("language", formData.language);
      formDataToSend.append("rating", formData.rating);
      formDataToSend.append("director", formData.director);
      formDataToSend.append("cast", JSON.stringify(formData.cast));
      formDataToSend.append("releaseDate", formData.releaseDate);
      formDataToSend.append("isActive", formData.isActive);

      const response = await fetch(
        `http://localhost:5000/api/movies/${movieId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        },
      );

      const data = await response.json();

      if (response.ok) {
        success("Movie updated successfully!");
        setTimeout(() => {
          navigate("/admin/movies");
        }, 1500);
      } else if (response.status === 403) {
        showError("You don't have permission to edit movies");
      } else if (response.status === 404) {
        showError("Movie not found");
      } else {
        showError(data.message || "Failed to update movie");
      }
    } catch (err) {
      console.error("Error updating movie:", err);
      showError("Error updating movie. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  const addCast = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()],
      }));
      setCastInput("");
    }
  };

  const removeCast = (index) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <button
              onClick={() => navigate("/admin/movies")}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-4"
            >
              <ArrowLeft size={20} />
              Back to Movies
            </button>
            <h1 className="text-4xl font-bold">Edit Movie</h1>
            <p className="text-slate-400 mt-2">Update movie information</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Loading movie details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Movie Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Inception"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Movie synopsis and details..."
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Poster File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Movie Poster
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-400 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handlePosterChange}
                        className="hidden"
                        id="poster-input"
                      />
                      <label htmlFor="poster-input" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-slate-400 w-8 h-8" />
                        <p className="text-sm text-slate-300">
                          Click to upload new poster
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          JPG, PNG, JPEG (Max 5MB)
                        </p>
                      </label>
                    </div>
                    {posterPreview && (
                      <div className="rounded-lg overflow-hidden border border-slate-600">
                        <img
                          src={posterPreview}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Director & Release Date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Director <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      placeholder="Director name"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Release Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                {/* Duration & Language */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Duration (mins) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="120"
                      min="30"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="U">U (Unrestricted)</option>
                      <option value="UA">UA (Parental Discretion)</option>
                      <option value="A">A (Adult)</option>
                      <option value="S">S (Specialized)</option>
                    </select>
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Genres <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {genreOptions.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          formData.genre.includes(genre)
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {formData.genre.length > 0 && (
                    <p className="text-sm text-cyan-400 mt-2">
                      Selected: {formData.genre.join(", ")}
                    </p>
                  )}
                </div>

                {/* Cast */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Cast Members
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={castInput}
                      onChange={(e) => setCastInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCast();
                        }
                      }}
                      placeholder="Add cast member name..."
                      className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={addCast}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-3 rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.cast.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.cast.map((actor, index) => (
                        <div
                          key={index}
                          className="bg-cyan-600 bg-opacity-30 border border-cyan-500 text-cyan-300 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          {actor}
                          <button
                            type="button"
                            onClick={() => removeCast(index)}
                            className="hover:text-cyan-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold">
                    This movie is active and available for bookings
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/movies")}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {submitting ? "Updating..." : "Update Movie"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
