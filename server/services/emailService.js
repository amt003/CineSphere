import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log("✅ SendGrid email service initialized");

/**
 * Send customer registration confirmation email
 */
export const sendCustomerRegistrationEmail = async (email, name) => {
  try {
    const msg = {
      to: email,
      from: "cinesphere.booking@gmail.com",
      subject: "Welcome to CineSphere! 🎬",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;text-align:center;color:white;border-radius:8px 8px 0 0"><h1 style="margin:0">Welcome to CineSphere</h1></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px"><p>Hi ${name},</p><p>Thank you for registering on CineSphere! 🎉</p><p>Your account has been successfully created. You can now: Book seats, Browse movies, Make secure payments, and Download digital tickets with QR codes.</p><p><a href="http://localhost:5173/auth/login" style="color:#667eea">Log in now</a></p><hr style="border:none;border-top:1px solid #ddd;margin:20px 0"><p style="color:#999;font-size:12px">CineSphere Team</p></div></div>`,
    };
    await sgMail.send(msg);
    console.log(`✅ Customer registration email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error sending customer registration email: ${error.message}`,
    );
    return false;
  }
};

export const sendTheatreRegistrationEmail = async (
  email,
  theatreName,
  ownerName,
) => {
  try {
    const msg = {
      to: email,
      from: "cinesphere.booking@gmail.com",
      subject: "Theatre Registration Submitted - Under Review 🎭",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);padding:20px;text-align:center;color:white;border-radius:8px 8px 0 0"><h1 style="margin:0">Application Received</h1></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px"><p>Hi ${ownerName},</p><p>Thank you for registering <strong>${theatreName}</strong> on CineSphere! 🎬</p><p>Your theatre registration is under review. Our team will verify your details within 24-48 hours.</p></div></div>`,
    };
    await sgMail.send(msg);
    console.log(`✅ Theatre registration email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error sending theatre registration email: ${error.message}`,
    );
    return false;
  }
};

export const sendTheatreApprovalEmail = async (
  email,
  theatreName,
  ownerName,
) => {
  try {
    const msg = {
      to: email,
      from: "cinesphere.booking@gmail.com",
      subject: "🎉 Your Theatre is Approved! Welcome to CineSphere",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:20px;text-align:center;color:white;border-radius:8px 8px 0 0"><h1 style="margin:0">🎉 You're Approved!</h1></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px"><p>Hi ${ownerName},</p><p>Great news! Your theatre <strong>${theatreName}</strong> has been approved and is now live on CineSphere!</p><div style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:20px;text-align:center;border-radius:8px;margin:20px 0"><a href="http://localhost:5173/admin/login" style="display:inline-block;background:white;color:#11998e;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold">Log In to Dashboard</a></div><p>You can now manage showtimes, set pricing, and view bookings!</p></div></div>`,
    };
    await sgMail.send(msg);
    console.log(`✅ Theatre approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending theatre approval email: ${error.message}`);
    return false;
  }
};

export const sendTheatreRejectionEmail = async (
  email,
  theatreName,
  ownerName,
  reason = "",
) => {
  try {
    const msg = {
      to: email,
      from: "cinesphere.booking@gmail.com",
      subject: "Your Theatre Registration - Application Status Update",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;text-align:center;color:white;border-radius:8px 8px 0 0"><h1 style="margin:0">Application Status Update</h1></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px"><p>Hi ${ownerName},</p><p>Thank you for your interest in CineSphere. Unfortunately, your application for <strong>${theatreName}</strong> was not approved at this time.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}<p>You can reapply with updated information.</p></div></div>`,
    };
    await sgMail.send(msg);
    console.log(`✅ Theatre rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending theatre rejection email: ${error.message}`);
    return false;
  }
};

export const sendBookingConfirmationEmail = async (
  email,
  customerName,
  movieName,
  theatreName,
  showtime,
  seats,
  bookingId,
  totalAmount,
  screenNumber,
) => {
  try {
    const msg = {
      to: email,
      from: "cinesphere.booking@gmail.com",
      subject: `Booking Confirmed! 🎫 ${movieName} at ${theatreName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;text-align:center;color:white;border-radius:8px 8px 0 0"><h1 style="margin:0">✓ Booking Confirmed!</h1></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px"><p>Hi ${customerName},</p><p>Your booking is confirmed! 🎬</p><div style="background:white;padding:20px;border:2px solid #667eea;border-radius:8px;margin:20px 0"><h3 style="margin-top:0;color:#667eea">Booking Details</h3><table style="width:100%;font-size:14px"><tr style="border-bottom:1px solid #eee"><td style="padding:10px 0"><strong>Movie:</strong></td><td style="text-align:right">${movieName}</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:10px 0"><strong>Theatre:</strong></td><td style="text-align:right">${theatreName}</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:10px 0"><strong>Screen:</strong></td><td style="text-align:right"><strong>Screen ${screenNumber || "N/A"}</strong></td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:10px 0"><strong>Showtime:</strong></td><td style="text-align:right">${showtime}</td></tr><tr style="border-bottom:1px solid #eee"><td style="padding:10px 0"><strong>Seats:</strong></td><td style="text-align:right"><strong>${seats}</strong></td></tr><tr><td style="padding:10px 0"><strong>Booking ID:</strong></td><td style="text-align:right"><strong>${bookingId}</strong></td></tr></table></div><div style="background:#f0f0f0;padding:15px;border-radius:8px;text-align:center;margin:20px 0"><p style="margin:0;color:#999;font-size:12px">Total Amount</p><h2 style="margin:0;color:#667eea">₹${totalAmount}</h2></div><p>Arrive 15 minutes early for smooth check-in. Enjoy your movie! 🍿</p><div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;text-align:center;border-radius:8px;margin:20px 0"><a href="http://localhost:5173/my-tickets" style="display:inline-block;background:white;color:#667eea;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold">View Your Tickets</a></div></div></div>`,
    };
    await sgMail.send(msg);
    console.log(`✅ Booking confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error sending booking confirmation email: ${error.message}`,
    );
    return false;
  }
};

export default sgMail;
