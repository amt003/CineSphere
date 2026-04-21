import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Save, X, Plus, Trash2, Grid3x3, ArrowLeft } from "lucide-react";

/**
 * ManageLayout.jsx - Hall Layout Builder
 * Theatre admins can visually configure their cinema hall layout
 * Allows setting rows, seats per row, VIP zones, and aisle positions
 */
export default function ManageLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hall configuration state
  const [rows, setRows] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(14);
  const [vipRows, setVipRows] = useState(["A", "B"]);
  const [aisleAfterSeat, setAisleAfterSeat] = useState([7]); // After seat 7
  const [priceStandard, setPriceStandard] = useState(150);
  const [priceVip, setPriceVip] = useState(250);

  // Generate row labels A, B, C, ... based on number of rows
  const generateRowLabels = (count) => {
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
  };

  const rowLabels = generateRowLabels(rows);

  // Fetch theatre data on mount
  useEffect(() => {
    const fetchTheatre = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:5000/api/theatres/${user.theatreId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        if (response.ok) {
          setTheatre(data.data);
          const layout = data.data.hallLayout;
          setRows(layout.rows || 8);
          setSeatsPerRow(layout.seatsPerRow || 14);
          setVipRows(layout.vipRows || ["A", "B"]);
          setAisleAfterSeat(layout.aisleAfterSeat || [7]);

          const pricing = data.data.pricing || {};
          setPriceStandard(pricing.standard || 150);
          setPriceVip(pricing.vip || 250);
        } else {
          showError(data.message || "Failed to load theatre");
        }
      } catch (err) {
        showError("Error loading theatre. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.theatreId) fetchTheatre();
  }, [user?.theatreId]);

  // Toggle VIP row
  const toggleVipRow = (row) => {
    setVipRows((prev) =>
      prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row],
    );
  };

  // Toggle aisle position
  const toggleAisle = (seatNum) => {
    setAisleAfterSeat((prev) =>
      prev.includes(seatNum)
        ? prev.filter((s) => s !== seatNum)
        : [...prev, seatNum],
    );
  };

  // Save hall layout
  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/theatres/${user.theatreId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hallLayout: {
              rows,
              seatsPerRow,
              vipRows,
              aisleAfterSeat: aisleAfterSeat.sort((a, b) => a - b),
            },
            pricing: {
              standard: priceStandard,
              vip: priceVip,
            },
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        success("Hall layout updated successfully!");
        setTheatre(data.data);
      } else {
        showError(data.message || "Failed to save layout");
      }
    } catch (err) {
      showError("Error saving layout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading theatre layout...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-4xl font-bold">Hall Layout Builder</h1>
            <p className="text-slate-400 mt-2">
              Configure your cinema hall layout, VIP zones, and pricing
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Configuration Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg p-6 border border-gray-700 sticky top-20">
                <h2 className="text-xl font-bold mb-6">Configuration</h2>

                {/* Rows */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Number of Rows: {rows}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Seats per row */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Seats per Row: {seatsPerRow}
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="20"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Pricing */}
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="font-semibold mb-4">Pricing</h3>
                  <div className="mb-3">
                    <label className="block text-sm mb-2">
                      Standard Seat (₹)
                    </label>
                    <input
                      type="number"
                      value={priceStandard}
                      onChange={(e) =>
                        setPriceStandard(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">VIP Seat (₹)</label>
                    <input
                      type="number"
                      value={priceVip}
                      onChange={(e) => setPriceVip(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveLayout}
                  disabled={saving}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Layout"}
                </button>
              </div>
            </div>

            {/* Right: Hall Preview & VIP/Aisle Configuration */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hall Preview */}
              <div className="bg-slate-800 rounded-lg p-8 border border-gray-700">
                <h2 className="text-xl font-bold mb-6">Hall Preview</h2>
                <div className="bg-slate-900 p-8 rounded-lg overflow-auto max-h-96">
                  <div className="inline-block">
                    {/* Screen */}
                    <div className="text-center mb-8">
                      <div className="inline-block px-8 py-2 bg-gray-400 text-black font-bold rounded-full">
                        SCREEN
                      </div>
                    </div>

                    {/* Seats Grid */}
                    <div className="space-y-2">
                      {rowLabels.map((row) => (
                        <div key={row} className="flex items-center gap-4">
                          <span className="w-6 text-right font-bold text-cyan-400">
                            {row}
                          </span>
                          <div className="flex gap-1">
                            {Array.from(
                              { length: seatsPerRow },
                              (_, i) => i + 1,
                            ).map((seatNum) => (
                              <div key={`${row}-${seatNum}`}>
                                <button
                                  className={`w-6 h-6 rounded text-xs font-bold transition ${
                                    vipRows.includes(row)
                                      ? "bg-amber-500 hover:bg-amber-600 text-black"
                                      : "bg-blue-500 hover:bg-blue-600 text-white"
                                  }`}
                                  title={`${row}${seatNum}`}
                                >
                                  •
                                </button>
                                {aisleAfterSeat.includes(seatNum) && (
                                  <div className="w-2 inline-block" />
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="w-6 font-bold text-cyan-400">
                            {row}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm">Standard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded" />
                    <span className="text-sm">VIP</span>
                  </div>
                </div>
              </div>

              {/* VIP Row Selection */}
              <div className="bg-slate-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Mark VIP Rows</h3>
                <div className="grid grid-cols-4 gap-2">
                  {rowLabels.map((row) => (
                    <button
                      key={row}
                      onClick={() => toggleVipRow(row)}
                      className={`py-2 px-4 rounded-lg font-bold transition ${
                        vipRows.includes(row)
                          ? "bg-amber-500 hover:bg-amber-600 text-black"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      Row {row}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Selected VIP rows:{" "}
                  {vipRows.length > 0 ? vipRows.join(", ") : "None"}
                </p>
              </div>

              {/* Aisle Configuration */}
              <div className="bg-slate-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Aisle Positions</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Click to place aisles between seats
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => toggleAisle(num)}
                        className={`py-2 px-3 rounded-lg font-bold transition text-sm ${
                          aisleAfterSeat.includes(num)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                        }`}
                      >
                        {num}
                      </button>
                    ),
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Aisles after seats:{" "}
                  {aisleAfterSeat.length > 0
                    ? aisleAfterSeat.join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
