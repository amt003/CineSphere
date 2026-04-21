import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import { Download, Share2, Printer } from "lucide-react";
import "./TicketCard.css";

/**
 * TicketCard.jsx - Animated Digital Ticket Display
 * Features:
 * - Animated ticket appearance with 3D flip effect
 * - QR code generation for ticket verification
 * - Download as PNG
 * - Print functionality
 * - Share ticket details
 */
export default function TicketCard({ booking, movie, showtime, theatre }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = React.useRef(null);

  if (!booking || !movie || !showtime) {
    return null;
  }

  // Download ticket as PNG
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#1e293b",
        scale: 2,
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ticket-${booking._id}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download ticket:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Print ticket
  const handlePrint = () => {
    const element = ticketRef.current;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(
      "<html><head><title>Ticket</title></head><body>",
    );
    printWindow.document.write(element.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="ticket-card-container">
      {/* 3D Flip Wrapper */}
      <div
        className={`ticket-flip-wrapper ${isFlipped ? "flipped" : ""}`}
        ref={ticketRef}
      >
        {/* Front of Ticket */}
        <div className="ticket-front">
          <div className="ticket-header">
            <div className="theatre-name">{theatre?.name || "Cinema"}</div>
            <div className="ticket-badge">TICKET</div>
          </div>

          <div className="ticket-movie-section">
            <div className="movie-poster">
              <img
                src={movie?.posterUrl}
                alt={movie?.title}
                className="poster-img"
              />
            </div>
            <div className="movie-info">
              <h1 className="movie-title">{movie?.title}</h1>
              <div className="movie-meta">
                <span className="rating">{movie?.rating}</span>
                <span className="duration">{movie?.duration} min</span>
              </div>
              <p className="language">{movie?.language}</p>
            </div>
          </div>

          <div className="ticket-details">
            <div className="detail-item">
              <span className="label">Date</span>
              <span className="value">
                {new Date(showtime?.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Time</span>
              <span className="value">{showtime?.time}</span>
            </div>
            <div className="detail-item">
              <span className="label">Seats</span>
              <span className="value seats-value">
                {booking?.seats?.join(", ")}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Location</span>
              <span className="value">{theatre?.location}</span>
            </div>
          </div>

          <div className="ticket-price-section">
            <span className="label">Total Price</span>
            <span className="price">₹{booking?.totalPrice}</span>
          </div>

          <div className="ticket-footer">
            <span className="booking-id">
              ID: {booking?._id?.substring(0, 8)}
            </span>
            <button
              className="flip-button"
              onClick={() => setIsFlipped(!isFlipped)}
              title="Show QR Code"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Back of Ticket (QR Code) */}
        <div className="ticket-back">
          <div className="qr-section">
            <h3>Verify Ticket</h3>
            <div className="qr-code-wrapper">
              <QRCode
                value={JSON.stringify({
                  bookingId: booking._id,
                  customerId: booking.customerId,
                  seats: booking.seats,
                  totalPrice: booking.totalPrice,
                })}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#1e293b"
                fgColor="#06b6d4"
              />
            </div>
            <p className="qr-text">Scan to verify your ticket</p>
            <p className="booking-reference">
              Booking Reference: {booking?._id?.substring(0, 12)}
            </p>
          </div>

          <button
            className="flip-button flip-back"
            onClick={() => setIsFlipped(!isFlipped)}
            title="Show Ticket"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ticket-actions">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="action-button download-btn"
          title="Download as PNG"
        >
          <Download className="w-4 h-4" />
          {downloading ? "Downloading..." : "Download"}
        </button>

        <button
          onClick={handlePrint}
          className="action-button print-btn"
          title="Print Ticket"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>

        <button
          className="action-button share-btn"
          title="Share Ticket"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${movie?.title} - Cinema Ticket`,
                text: `I'm watching ${movie?.title} at ${theatre?.name}!`,
              });
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Ticket Info */}
      <div className="ticket-info">
        <p className="info-text">
          ✓ This is your digital ticket. Show it at the venue on the day of
          screening.
        </p>
        <p className="info-text">
          ✓ Keep this ticket safe. You can download or print it anytime.
        </p>
      </div>
    </div>
  );
}
