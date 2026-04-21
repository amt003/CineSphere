import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Upload, Trash2, Edit, Plus } from "lucide-react";

export default function SuperAdminMovies() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to get proper poster URL
  const getPosterUrl = (url) => {
    if (!url || url.trim() === "") {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%232d3748'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%2390cdf4' text-anchor='middle' dominant-baseline='middle'%3EMovie Poster%3C/text%3E%3C/svg%3E";
    }
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("/uploads")) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "English",
    rating: "UA",
    director: "",
    cast: "",
    releaseDate: "",
    isFeatured: false,
    poster: null,
  });

  useEffect(() => {
    if (userRole !== "superadmin") {
      navigate("/");
      return;
    }
    fetchMovies();
  }, [userRole, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5000/api/superadmin/movies",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMovies(data.data || []);
      }
    } catch (err) {
      setError("Failed to load movies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError("Only JPG, PNG, JPEG formats are allowed");
        return;
      }
      setFormData({ ...formData, poster: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const token = localStorage.getItem("accessToken");
      const form = new FormData();

      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append(
        "genre",
        formData.genre.split(",").map((g) => g.trim()),
      );
      form.append("duration", formData.duration);
      form.append("language", formData.language);
      form.append("rating", formData.rating);
      form.append("director", formData.director);
      form.append(
        "cast",
        formData.cast.split(",").map((c) => c.trim()),
      );
      form.append("releaseDate", formData.releaseDate);
      form.append("isFeatured", formData.isFeatured);
      if (formData.poster) {
        form.append("poster", formData.poster);
      }

      const url = editingId
        ? `http://localhost:5000/api/superadmin/movies/${editingId}`
        : "http://localhost:5000/api/superadmin/movies";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (response.ok) {
        setSuccess(editingId ? "Movie updated!" : "Movie created!");
        setFormData({
          title: "",
          description: "",
          genre: "",
          duration: "",
          language: "English",
          rating: "UA",
          director: "",
          cast: "",
          releaseDate: "",
          isFeatured: false,
          poster: null,
        });
        setPosterPreview(null);
        setEditingId(null);
        setShowForm(false);
        fetchMovies();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save movie");
      }
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre.join(", "),
      duration: movie.duration,
      language: movie.language,
      rating: movie.rating,
      director: movie.director,
      cast: movie.cast.join(", "),
      releaseDate: movie.releaseDate?.split("T")[0],
      isFeatured: movie.isFeatured || false,
      poster: null,
    });
    setPosterPreview(getPosterUrl(movie.posterUrl));
    setEditingId(movie._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/superadmin/movies/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setSuccess("Movie deleted!");
        fetchMovies();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to delete movie");
      }
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate("/superadmin/dashboard")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-4xl font-bold">Manage Featured Movies</h1>
            <p className="text-slate-400 mt-2">
              Upload and manage movie posters and details
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-900 bg-opacity-50 border border-green-600 rounded-lg text-green-200">
              {success}
            </div>
          )}

          {/* Add Movie Button */}
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setPosterPreview(null);
              }}
              className="mb-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Add New Movie
            </button>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? "Edit Movie" : "Add New Movie"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Poster Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Movie Poster *
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
                        <Upload className="mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-300">
                          Drag & drop or click to upload
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

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter movie title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter movie description"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Genre (comma-separated) *
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., Action, Sci-Fi, Drama"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="30"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., 120"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="U">U (Unrestricted)</option>
                    <option value="UA">UA (Parental Discretion)</option>
                    <option value="A">A (Restricted)</option>
                    <option value="S">S (Specialized)</option>
                  </select>
                </div>

                {/* Director */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Director *
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter director name"
                  />
                </div>

                {/* Cast */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Cast (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="cast"
                    value={formData.cast}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., Actor 1, Actor 2"
                  />
                </div>

                {/* Release Date */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Release Date *
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 cursor-pointer"
                  />
                  <label htmlFor="featured" className="cursor-pointer">
                    Show on Landing Page
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-semibold transition"
                  >
                    {editingId ? "Update Movie" : "Create Movie"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setPosterPreview(null);
                    }}
                    className="px-6 py-2 border-2 border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Movies Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading movies...</p>
            </div>
          ) : movies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-600 transition group"
                >
                  {/* Poster */}
                  <div className="aspect-video bg-slate-700 relative overflow-hidden">
                    {movie.posterUrl ? (
                      <img
                        src={getPosterUrl(movie.posterUrl)}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        No Poster
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {movie.genre.join(", ")} • {movie.duration}m
                    </p>
                    {movie.isFeatured && (
                      <div className="inline-block px-2 py-1 bg-cyan-600 bg-opacity-30 text-cyan-300 text-xs rounded mb-3">
                        Featured
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold transition"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-xs font-semibold transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-lg">No movies yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
