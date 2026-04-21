import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, AlertCircle } from "lucide-react";

export default function MovieCard({ movie, theatreId }) {
  const { _id, title, posterUrl, genre, duration, rating, description } = movie;

  // Construct full URL for poster
  const getPosterUrl = () => {
    if (!posterUrl || posterUrl.trim() === "") {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%232d3748'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%2390cdf4' text-anchor='middle' dominant-baseline='middle'%3EMovie Poster%3C/text%3E%3C/svg%3E";
    }
    if (posterUrl.startsWith("http")) {
      return posterUrl;
    }
    if (posterUrl.startsWith("/uploads")) {
      return `http://localhost:5000${posterUrl}`;
    }
    return posterUrl;
  };

  return (
    <Link to={`/movie/${_id}/${theatreId}`} className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
        {/* Poster Image */}
        <img
          src={getPosterUrl()}
          alt={title}
          className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-cyan-500 text-white px-3 py-1 rounded-full font-bold text-sm">
          {rating}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-lg line-clamp-1">{title}</h3>

          <div className="flex items-center gap-2 text-gray-300 text-sm mt-2">
            <Clock className="w-4 h-4" />
            <span>{duration} min</span>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {genre?.slice(0, 2).map((g, i) => (
              <span
                key={i}
                className="text-xs bg-slate-700 text-gray-200 px-2 py-1 rounded"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-xs mt-2 line-clamp-2">
            {description}
          </p>

          <button className="mt-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}
