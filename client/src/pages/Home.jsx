import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { Search, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError, info } = useToast();
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch theatres
  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/theatres");
        const data = await response.json();
        if (response.ok) {
          setTheatres(data.data || []);
          if (data.data && data.data.length > 0) {
            setSelectedTheatreId(data.data[0]._id);
          }
        } else {
          showError("Failed to load theatres");
        }
      } catch (err) {
        showError("Error loading theatres. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, []);

  // Fetch movies when theatre changes
  useEffect(() => {
    if (!selectedTheatreId) return;

    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/movies?theatreId=${selectedTheatreId}`,
        );
        const data = await response.json();
        if (response.ok) {
          setMovies(data.data || []);
          if (!data.data || data.data.length === 0) {
            info("No movies available in this theatre");
          }
        } else {
          showError("Failed to load movies");
        }
      } catch (err) {
        showError("Error loading movies. Please try again.");
      }
    };

    fetchMovies();
  }, [selectedTheatreId]);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

  const selectedTheatre = theatres.find((t) => t._id === selectedTheatreId);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Now Showing</h1>
            <p className="text-slate-400">
              Book your favorite movies at your nearest theatre
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Theatre Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Select Theatre</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {theatres.map((theatre) => (
                <button
                  key={theatre._id}
                  onClick={() => setSelectedTheatreId(theatre._id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedTheatreId === theatre._id
                      ? "border-cyan-500 bg-cyan-500 bg-opacity-10"
                      : "border-slate-600 hover:border-slate-500 bg-slate-700"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-2">{theatre.name}</h3>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <MapPin size={16} />
                    {theatre.location}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Seats: {theatre.hallLayout?.seatsPerRow || 14} ×{" "}
                    {theatre.hallLayout?.rows || 8}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search
                className="absolute left-4 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          {/* Movies Grid */}
          {selectedTheatre && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Movies at {selectedTheatre.name}
              </h2>

              {filteredMovies.length > 0 ? (
                <div className="grid md:grid-cols-4 gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie._id}
                      movie={movie}
                      theatreId={selectedTheatreId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">
                    {searchQuery
                      ? "No movies found matching your search"
                      : "No movies available at this theatre"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
