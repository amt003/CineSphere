# 🎬 CineSphere - Multi-Screen Cinema Booking Platform

A full-stack SaaS cinema booking platform with real-time seat management, multi-screen support, and integrated payment processing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Key Features Implementation](#key-features-implementation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### Customer Portal

- 🎭 **Movie Browsing**: Browse theatres and showtimes
- 🪑 **Seat Selection**: Interactive 3D-style seat picker with real-time locking
- 💳 **Payment Processing**: Razorpay integration for secure payments
- 🎟️ **Booking Management**: View, download, and share tickets
- 📱 **Real-Time Updates**: Socket.io for live seat availability

### Theatre Admin Portal

- 🏢 **Theatre Management**: Configure halls, screens, and pricing
- 📽️ **Showtime Management**: Create and manage showtimes across multiple screens
- 🔢 **Multi-Screen Support**: Manage 1-10 screens with automatic conflict detection
- 📊 **Analytics Dashboard**: Revenue, occupancy, and booking insights
- 🎨 **Hall Configuration**: Customize rows, seats, VIP zones, and aisles

### Super Admin Portal

- ✅ **Theatre Approval**: Review and approve new theatre registrations
- 📊 **Platform Analytics**: System-wide statistics and monitoring

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3.1 with Vite 5.4.21
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Real-time**: Socket.io client
- **Icons**: Lucide React
- **Build**: Vite

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io 4.6.1
- **Authentication**: JWT (access + refresh tokens)
- **Payment**: Razorpay SDK
- **Email**: SendGrid

### Infrastructure

- **Cloud Database**: MongoDB Atlas
- **Payment Gateway**: Razorpay
- **Email Service**: SendGrid

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB Atlas account
- Razorpay account (for payments)
- SendGrid account (for emails)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cinesphere.git
cd cinesphere
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cinesphere
PORT=5000
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
SENDGRID_API_KEY=your_sendgrid_key
CLIENT_URL=http://localhost:5173
EOF

# Start server
npm start
# Expected: "🎬 CineSphere Server running on http://localhost:5000"
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
EOF

# Start dev server
npm run dev
# Expected: "Local: http://localhost:5173"
```

### 4. Access Application

- **Customer Portal**: http://localhost:5173
- **Theatre Admin**: http://localhost:5173/admin
- **Super Admin**: http://localhost:5173/superadmin

---

## 📁 Project Structure

```
cinesphere/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorHandler.js       # Error handling
│   ├── models/
│   │   ├── User.js               # Customer & Admin users
│   │   ├── Theatre.js            # Theatre with numberOfScreens
│   │   ├── Movie.js              # Movies
│   │   ├── Showtime.js           # Showtimes with screen field
│   │   ├── Seat.js               # Seat management
│   │   ├── Booking.js            # Bookings
│   │   └── Payment.js            # Payment records
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   ├── theatres.js           # Theatre CRUD + dashboard
│   │   ├── movies.js             # Movie CRUD
│   │   ├── showtimes.js          # Showtime CRUD + conflict detection
│   │   ├── seats.js              # Seat lock/unlock
│   │   ├── bookings.js           # Booking lifecycle
│   │   └── payments.js           # Razorpay integration
│   ├── socket/
│   │   └── seatLock.js           # Socket.io real-time seat locking
│   ├── scripts/
│   │   └── updateTheatreScreens.js  # Data migration
│   └── index.js                  # Server entry point
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Main navigation
│   │   │   ├── ProtectedRoute.jsx # Auth guard
│   │   │   ├── SeatPicker/       # Interactive seat selection
│   │   │   └── TicketCard/       # Ticket display component
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Auth state management
│   │   │   └── ToastContext.js   # Toast notifications
│   │   ├── hooks/
│   │   │   └── useSocket.js      # Socket.io integration
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Movie browsing
│   │   │   ├── Booking.jsx       # Seat selection
│   │   │   ├── Payment.jsx       # Payment processing
│   │   │   ├── MyTickets.jsx     # Customer bookings
│   │   │   ├── CreateShowtime.jsx    # Multi-screen showtime creator
│   │   │   ├── EditShowtime.jsx      # Edit showtime with screen change
│   │   │   ├── TheatreShowtimes.jsx  # List showtimes by screen
│   │   │   ├── ManageLayout.jsx      # Hall configuration
│   │   │   ├── TheatreAnalytics.jsx  # Analytics dashboard
│   │   │   └── ... (auth & admin pages)
│   │   ├── App.jsx               # Main app with routing
│   │   └── main.jsx              # Entry point
│   └── vite.config.js            # Vite configuration
│
├── TESTING_GUIDE.md              # Comprehensive testing scenarios
├── DEPLOYMENT_GUIDE.md           # Production deployment guide
└── README.md                     # This file
```

---

## 🎯 Key Features Implementation

### 1. Multi-Screen Support

```javascript
// Theatre model includes numberOfScreens (1-10)
// Each showtime has a screen number
// Conflict detection checks same-screen overlaps within 3-hour window

// Flow:
// 1. Register theatre with numberOfScreens
// 2. Create showtime → Select screen (1-N)
// 3. System checks: Same theatre + same screen + 2.5h overlap
// 4. Different screens at same time = No conflict ✅
```

### 2. Real-Time Seat Locking

```javascript
// Socket.io events:
// - join-showtime: User joins showtime room
// - lock-seats: Locks seats for user (5-minute TTL)
// - unlock-seats: Unlocks when user deselects
// - confirm-booking: Marks as permanently booked
// - seats-locked/unlocked: Broadcast to all users

// Result: Live seat updates across all connected clients
```

### 3. Payment Processing

```javascript
// Razorpay integration:
// 1. POST /api/payments/create-order → Razorpay order
// 2. Show Razorpay widget with prefilled customer data
// 3. Customer completes payment
// 4. POST /api/payments/verify → HMAC signature validation
// 5. Update booking status to "confirmed"
// 6. Redirect to tickets page
```

### 4. Theatre Admin Analytics

```javascript
// Dashboard shows:
// - Total bookings count
// - Total revenue (₹)
// - Active showtimes count
// - Occupancy rate (%)
// - Revenue trends
// - Booking timeline

// Data fetched from: GET /api/theatres/:id/dashboard
```

---

## 📡 API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/register-theatre
POST /api/auth/login-theatre
```

### Theatres

```
GET /api/theatres
GET /api/theatres/:id
PUT /api/theatres/:id
GET /api/theatres/:id/dashboard
```

### Movies

```
GET /api/movies
GET /api/movies/:id
POST /api/movies (theatre admin)
PUT /api/movies/:id (theatre admin)
```

### Showtimes

```
GET /api/showtimes?theatreId=xxx&date=yyyy-mm-dd
POST /api/showtimes (create with screen validation)
PUT /api/showtimes/:id (update, re-validate conflicts)
DELETE /api/showtimes/:id
```

### Seats

```
GET /api/seats/showtime/:showtimeId
POST /api/seats/lock (lock seats for user)
POST /api/seats/unlock (unlock user's seats)
```

### Bookings

```
POST /api/bookings (create booking)
GET /api/bookings/my (customer's bookings)
PATCH /api/bookings/:id/confirm (payment success)
PATCH /api/bookings/:id/cancel
```

### Payments

```
POST /api/payments/create-order
POST /api/payments/verify
GET /api/payments/:bookingId
```

---

## 🧪 Testing

### Run Test Scenarios

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for:

- 7 comprehensive test scenarios
- Step-by-step procedures
- Expected results
- Debugging commands

### Key Tests

1. **Theatre Admin Registration** - Multi-screen setup
2. **Showtime Creation** - Screen-specific conflict detection
3. **Booking Flow** - End-to-end seat selection → payment
4. **Real-Time Locking** - Socket.io seat synchronization
5. **Payment Processing** - Razorpay integration
6. **Analytics Dashboard** - Data accuracy
7. **Hall Configuration** - Layout management

---

## 🚀 Deployment

### Production Checklist

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:

- Environment configuration
- Database setup
- Third-party service integration
- Security hardening
- Monitoring setup
- Deployment options

### Quick Deploy

```bash
# Backend (Render/Railway)
npm install
npm start

# Frontend (Vercel/Netlify)
npm install
npm run build
# Deploy dist/ folder
```

---

## 📊 Database Schema

### Theatre

```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  numberOfScreens: Number (1-10),
  hallLayout: {
    rows: Number,
    seatsPerRow: Number,
    vipRows: [String],
    aisleAfterSeat: [Number]
  },
  pricing: {
    standard: Number,
    vip: Number
  },
  status: String (pending/approved/rejected),
  adminId: ObjectId,
  approvalDate: Date
}
```

### Showtime

```javascript
{
  _id: ObjectId,
  theatreId: ObjectId,
  movieId: ObjectId,
  screen: Number (1-N),
  date: Date,
  time: String,
  totalSeats: Number,
  bookedSeats: Number,
  createdAt: Date
  // Index: {theatreId: 1, screen: 1, date: 1, time: 1}
}
```

### Booking

```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  theatreId: ObjectId,
  showtimeId: ObjectId,
  movieId: ObjectId,
  seats: [String],
  totalPrice: Number,
  status: String (pending/confirmed/cancelled),
  paymentId: String,
  createdAt: Date
}
```

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (customer/admin/superadmin)
- ✅ Razorpay signature verification
- ✅ Theatre data isolation (theatreId scoping)
- ✅ Protected routes with authentication middleware
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Password hashing (bcrypt)

---


## 📝 Environment Variables Reference

### Server (.env)

```
MONGODB_URI          # MongoDB Atlas connection string
PORT                 # Server port (default: 5000)
NODE_ENV             # development/production
CLIENT_URL           # Frontend URL for CORS
JWT_SECRET           # Access token secret
REFRESH_TOKEN_SECRET # Refresh token secret
RAZORPAY_KEY_ID      # Razorpay public key
RAZORPAY_KEY_SECRET  # Razorpay secret key
SENDGRID_API_KEY     # SendGrid email API key
```

### Client (.env)

```
VITE_API_URL         # Backend API URL
VITE_SOCKET_URL      # Socket.io server URL
```


## 🎉 Getting Help

### Documentation

- [Testing Guide](./TESTING_GUIDE.md) - 7 test scenarios with step-by-step procedures
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment checklist

### Logs & Debugging

```bash
# Backend logs
tail -f server/logs/debug.log

# Frontend DevTools
F12 → Console & Network tabs

# Socket.io
DevTools → Network → WS tab for WebSocket messages
```
## 🎬 CineSphere - Making Cinema Booking Seamless 🎬
