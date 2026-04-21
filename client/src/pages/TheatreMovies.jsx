import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Plus, Trash2, Edit2, Search, Filter } from "lucide-react";

export default function TheatreMovies() {
  const { userTheatreId } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/movies?theatreId=${userTheatreId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (response.ok) {
          const moviesList = Array.isArray(data.data) ? data.data : [];
          setMovies(moviesList);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userTheatreId) {
      fetchMovies();
    }
  }, [userTheatreId]);

  // Filter movies based on search and status
  useEffect(() => {
    let filtered = movies;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) =>
        statusFilter === "active" ? m.isActive : !m.isActive,
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.genre?.some((g) =>
            g.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    setFilteredMovies(filtered);
  }, [movies, searchTerm, statusFilter]);

  const handleDelete = async (movieId, movieTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
      return;
    }

    try {
      setDeleting(movieId);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/movies/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setMovies(movies.filter((m) => m._id !== movieId));
        success("Movie deleted successfully!");
      } else if (response.status === 403) {
        showError("You don't have permission to delete this movie");
      } else if (response.status === 404) {
        showError("Movie not found");
      } else {
        showError("Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
      showError("Error deleting movie. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Theatre Movies</h1>
                <p className="text-slate-400">
                  Add and manage your theatre's movie collection
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/movies/new")}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                <Plus size={20} />
                Add Movie
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by title, director, or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Movies</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-end gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Movies</p>
                  <p className="text-2xl font-bold">{movies.length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {movies.filter((m) => m.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-slate-400">Loading movies...</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => (
                <div
                  key={movie._id}
                  className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-cyan-500 transition group"
                >
                  {/* Poster */}
                  <div className="relative h-64 bg-slate-700 overflow-hidden">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Poster
                      </div>
                    )}
                    {!movie.isActive && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-semibold">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">
                      {movie.title}
                    </h3>

                    <div className="space-y-2 text-sm mb-4">
                      <p className="text-slate-400">
                        <span className="font-semibold">{movie.director}</span>
                      </p>
                      <p className="text-slate-400">
                        {movie.genre?.join(", ")} • {movie.language} •{" "}
                        {movie.duration}min
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 bg-opacity-20 text-amber-300 px-2 py-1 rounded text-xs font-semibold">
                          {movie.rating}
                        </span>
                        {movie.isActive ? (
                          <span className="bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-500 bg-opacity-20 text-red-300 px-2 py-1 rounded text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/movies/edit/${movie._id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id, movie.title)}
                        disabled={deleting === movie._id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
              <p className="text-slate-400 text-lg mb-4">
                {movies.length === 0
                  ? "No movies added yet. Start by adding your first movie!"
                  : "No movies match your search criteria"}
              </p>
              {movies.length === 0 && (
                <button
                  onClick={() => navigate("/admin/movies/new")}
                  className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  <Plus size={20} />
                  Add First Movie
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
