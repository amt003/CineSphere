import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import "./SeatPicker.css";

/**
 * SeatPicker.jsx - 3D Cinema Hall Seat Selection Component
 * Features:
 * - 3D perspective view of cinema hall
 * - VIP and standard seat pricing
 * - Real-time seat selection
 * - Booked seat visualization
 * - Locked seat visualization (from other users)
 */
export default function SeatPicker({
  showtimeData,
  seats,
  selectedSeats,
  onSeatClick,
  maxSeats = 8,
  vipRows = ["A", "B"],
  aisleAfterSeat = [7],
  lockedSeats = {},
  bookedSeats = [],
  pricing = { standard: 150, vip: 250 },
}) {
  // Group seats by row
  const seatsByRow = useMemo(() => {
    const grouped = {};
    seats?.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });

    // Sort seats by number within each row
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => a.number - b.number);
    });

    return grouped;
  }, [seats]);

  const rowLabels = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

  // Get seat status
  const getSeatStatus = (seat) => {
    if (bookedSeats.includes(seat.seatId)) return "booked";
    if (lockedSeats[seat.seatId]) return "locked";
    if (selectedSeats.includes(seat.seatId)) return "selected";
    return "available";
  };

  // Get seat price
  const getSeatPrice = (row) => {
    return vipRows.includes(row) ? pricing.vip : pricing.standard;
  };

  // Calculate total selected price
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats?.find((s) => s.seatId === seatId);
      if (seat) {
        const price = vipRows.includes(seat.row)
          ? pricing.vip
          : pricing.standard;
        return sum + price;
      }
      return sum;
    }, 0);
  }, [selectedSeats, seats, vipRows, pricing]);

  const canSelectMore = selectedSeats.length < maxSeats;

  return (
    <div className="seat-picker">
      {/* 3D Hall Container */}
      <div className="hall-container">
        {/* Screen */}
        <div className="screen">
          <div className="screen-inner">SCREEN</div>
        </div>

        {/* Seats Grid with 3D Perspective */}
        <div className="seats-wrapper">
          <div className="seats-grid">
            {rowLabels.map((row) => (
              <div key={row} className="seat-row">
                {/* Row Label Left */}
                <div className="row-label">{row}</div>

                {/* Seats */}
                <div className="seats-container">
                  {seatsByRow[row].map((seat) => {
                    const status = getSeatStatus(seat);
                    const isVip = vipRows.includes(row);
                    const price = getSeatPrice(row);
                    const isDisabled =
                      status === "booked" ||
                      status === "locked" ||
                      (!canSelectMore && status !== "selected");

                    return (
                      <div key={seat.seatId} className="seat-wrapper">
                        <button
                          onClick={() =>
                            !isDisabled && onSeatClick(seat.seatId)
                          }
                          disabled={isDisabled}
                          className={`seat seat-${status} ${isVip ? "seat-vip" : "seat-standard"}`}
                          title={`${seat.seatId} - ₹${price} ${
                            status === "booked"
                              ? "(Booked)"
                              : status === "locked"
                                ? "(Locked)"
                                : ""
                          }`}
                        >
                          <span className="seat-number">{seat.number}</span>
                        </button>

                        {/* Aisle Gap */}
                        {aisleAfterSeat.includes(seat.number) && (
                          <div className="aisle-gap" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row Label Right */}
                <div className="row-label">{row}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-seat seat-available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-standard-legend" />
          <span>Standard (₹{pricing.standard})</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-vip-legend" />
          <span>VIP (₹{pricing.vip})</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-selected" />
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-locked" />
          <span>Locked</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat seat-booked" />
          <span>Booked</span>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="selection-summary">
        <div className="selected-seats">
          <h3>
            Selected Seats ({selectedSeats.length}/{maxSeats})
          </h3>
          {selectedSeats.length > 0 ? (
            <div className="seats-list">
              {selectedSeats.map((seatId) => {
                const seat = seats?.find((s) => s.seatId === seatId);
                const price = getSeatPrice(seat?.row);
                return (
                  <div key={seatId} className="seat-item">
                    <span className="seat-id">{seatId}</span>
                    <span className="seat-price">₹{price}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No seats selected</p>
          )}
        </div>

        {/* Price Summary */}
        <div className="price-summary">
          <div className="price-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="price-row">
            <span>Convenience Fee</span>
            <span>₹20</span>
          </div>
          <div className="price-total">
            <span>Total</span>
            <span>₹{totalPrice + 20}</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {!canSelectMore && selectedSeats.length > 0 && (
        <div className="warning-banner">
          <AlertCircle className="w-4 h-4" />
          <span>Maximum {maxSeats} seats per booking</span>
        </div>
      )}
    </div>
  );
}
