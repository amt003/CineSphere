# CineSphere — Full Project Build Prompt

Use this as your master prompt when starting the project in VS Code with Claude Code or any AI coding assistant.

---

## Project Overview

Build **CineSphere**, a multi-tenant SaaS cinema ticket booking web application. Each theatre signs up independently and gets their own isolated environment. Customers browse available theatres, pick showtimes, and book seats through an immersive 3D-perspective seat picker UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Seat Picker UI | CSS 3D transforms + SVG |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access token + refresh token) |
| Real-time | Socket.io (live seat locking) |
| Payments | Razorpay |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## User Roles (3 Types)

### 1. Super Admin (Platform Owner)
- Single account — the developer/owner of CineSphere
- Can onboard, approve, or suspend theatre accounts
- Sees platform-wide analytics (total bookings, revenue, active theatres)
- JWT payload: `{ role: "superadmin", userId: "..." }`

### 2. Theatre Admin (One per Theatre)
- Registers their theatre on CineSphere
- Sets up their own hall layout (rows, seat count, VIP zones, pricing)
- Adds movies, showtimes, and manages their own bookings
- Cannot access any other theatre's data — strictly isolated by `theatreId`
- JWT payload: `{ role: "theatreAdmin", userId: "...", theatreId: "T001" }`

### 3. Customer (Movie-goer)
- Registers once, can book at any theatre on the platform
- Browses movies showing at a chosen theatre
- Selects showtime → picks seats visually → pays → gets digital ticket
- JWT payload: `{ role: "customer", userId: "..." }`

---

## Multi-Tenancy Architecture

Every piece of data (movies, seats, bookings, showtimes) is scoped to a `theatreId`. The auth middleware automatically injects `theatreId` from the JWT into every Theatre Admin API query, making cross-theatre data access impossible even if the API is called directly.

---

## Folder Structure

```
cinesphere/
├── client/                         # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── SeatPicker/         # 3D cinema hall + seat grid
│   │   │   │   ├── SeatPicker.jsx
│   │   │   │   ├── SeatRow.jsx
│   │   │   │   └── SeatLegend.jsx
│   │   │   ├── TicketCard/         # Animated digital ticket on success
│   │   │   │   └── TicketCard.jsx
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.jsx
│   │   │   └── MovieCard/
│   │   │       └── MovieCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Browse theatres / now showing
│   │   │   ├── MovieDetail.jsx     # Movie info + showtime selector
│   │   │   ├── Booking.jsx         # Seat picker + payment
│   │   │   ├── MyTickets.jsx       # Customer booking history
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx   # Theatre Admin dashboard
│   │   │   │   ├── ManageMovies.jsx
│   │   │   │   ├── ManageLayout.jsx
│   │   │   │   └── ManageShowtimes.jsx
│   │   │   └── superadmin/
│   │   │       └── SuperDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT storage + user state
│   │   ├── hooks/
│   │   │   ├── useSocket.js        # Socket.io connection hook
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with JWT headers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                         # Node.js + Express backend
    ├── models/
    │   ├── User.js
    │   ├── Theatre.js
    │   ├── Movie.js
    │   ├── Showtime.js
    │   ├── Seat.js
    │   └── Booking.js
    ├── routes/
    │   ├── auth.js                 # /api/auth — register, login, refresh
    │   ├── theatres.js             # /api/theatres
    │   ├── movies.js               # /api/movies
    │   ├── showtimes.js            # /api/showtimes
    │   ├── seats.js                # /api/seats
    │   └── bookings.js             # /api/bookings
    ├── middleware/
    │   ├── authMiddleware.js       # Verify JWT, attach user + theatreId
    │   └── roleMiddleware.js       # Guard routes by role
    ├── socket/
    │   └── seatLock.js             # Socket.io real-time seat locking
    ├── config/
    │   └── db.js                   # MongoDB connection
    ├── .env
    └── index.js                    # Express app entry point
```

---

## MongoDB Schemas

### User
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,              // bcrypt hashed
  role: { type: String, enum: ['superadmin', 'theatreAdmin', 'customer'] },
  theatreId: { type: ObjectId, ref: 'Theatre', default: null }, // only for theatreAdmin
  refreshToken: String,
  createdAt: Date
}
```

### Theatre
```js
{
  name: String,
  location: String,
  adminId: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  hallLayout: {
    rows: Number,
    seatsPerRow: Number,
    vipRows: [String],           // e.g. ['A', 'B']
    aisleAfterSeat: [Number]     // e.g. [3, 10] — aisle gaps
  },
  pricing: {
    standard: Number,
    vip: Number
  },
  createdAt: Date
}
```

### Movie
```js
{
  theatreId: { type: ObjectId, ref: 'Theatre' },
  title: String,
  genre: [String],
  duration: Number,              // in minutes
  poster: String,                // URL
  language: String,
  rating: String,                // e.g. 'U/A'
  isActive: Boolean
}
```

### Showtime
```js
{
  theatreId: { type: ObjectId, ref: 'Theatre' },
  movieId: { type: ObjectId, ref: 'Movie' },
  date: Date,
  time: String,                  // e.g. '7:30 PM'
  totalSeats: Number,
  availableSeats: Number
}
```

### Seat
```js
{
  theatreId: { type: ObjectId, ref: 'Theatre' },
  showtimeId: { type: ObjectId, ref: 'Showtime' },
  seatId: String,                // e.g. 'A-5'
  row: String,
  number: Number,
  type: { type: String, enum: ['standard', 'vip'] },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy: { type: ObjectId, ref: 'User', default: null },
  lockedAt: Date,                // TTL: auto-expire lock after 5 minutes
  bookedBy: { type: ObjectId, ref: 'User', default: null }
}
```

### Booking
```js
{
  customerId: { type: ObjectId, ref: 'User' },
  theatreId: { type: ObjectId, ref: 'Theatre' },
  movieId: { type: ObjectId, ref: 'Movie' },
  showtimeId: { type: ObjectId, ref: 'Showtime' },
  seats: [String],               // e.g. ['A-3', 'A-4']
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentId: String,             // Razorpay payment ID
  createdAt: Date
}
```

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register customer or theatre admin |
| POST | `/login` | Public | Login, returns access + refresh token |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/logout` | Auth | Invalidate refresh token |

### Theatres — `/api/theatres`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all active theatres |
| POST | `/` | Super Admin | Approve/create a theatre |
| GET | `/:id` | Public | Get single theatre details |
| PUT | `/:id` | Theatre Admin | Update own theatre layout/pricing |
| PATCH | `/:id/status` | Super Admin | Suspend or activate a theatre |

### Movies — `/api/movies`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all movies (filter by theatreId) |
| POST | `/` | Theatre Admin | Add a movie to own theatre |
| PUT | `/:id` | Theatre Admin | Update movie details |
| DELETE | `/:id` | Theatre Admin | Remove a movie |

### Showtimes — `/api/showtimes`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get showtimes (filter by movieId + date) |
| POST | `/` | Theatre Admin | Create a showtime |
| DELETE | `/:id` | Theatre Admin | Cancel a showtime |

### Seats — `/api/seats`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/:showtimeId` | Public | Get seat map for a showtime |
| PATCH | `/lock` | Customer (Auth) | Temporarily lock selected seats |
| PATCH | `/unlock` | Customer (Auth) | Release locked seats |

### Bookings — `/api/bookings`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Customer (Auth) | Create booking after payment |
| GET | `/my` | Customer (Auth) | Get own booking history |
| GET | `/theatre` | Theatre Admin | Get all bookings for own theatre |
| PATCH | `/:id/cancel` | Customer (Auth) | Cancel a booking |

---

## Real-time Seat Locking (Socket.io)

When a customer selects seats, those seats are **locked for 5 minutes** using Socket.io + MongoDB TTL index. All other users in the same showtime room see those seats turn yellow instantly.

### Events
```
Client emits:   join-showtime     { showtimeId }
Client emits:   lock-seats        { showtimeId, seatIds, userId }
Client emits:   unlock-seats      { showtimeId, seatIds }

Server emits:   seats-locked      { seatIds, lockedBy }
Server emits:   seats-unlocked    { seatIds }
Server emits:   seats-booked      { seatIds }
```

### TTL Index (MongoDB auto-expire locks)
```js
SeatSchema.index({ lockedAt: 1 }, { expireAfterSeconds: 300 }); // 5 min
```

---

## Authentication Middleware

```js
// authMiddleware.js
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { userId, role, theatreId }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Usage example:
router.post('/', protect, requireRole('theatreAdmin'), addMovie);
```

---

## 3D Seat Picker UI — Key Behaviour

- Cinema hall rendered with CSS `perspective` + `rotateX` transform to create the 3D theatre-view effect
- Seat rows labelled A–H (or however the Theatre Admin configured them)
- VIP rows (e.g. A, B) styled in gold/amber
- Booked seats shown in red — not clickable
- Locked seats (by another user) shown in yellow — not clickable
- Selected seats highlighted in blue, with a booking summary panel below showing seat IDs and total price
- Max 8 seats per booking
- On successful Razorpay payment → animated digital ticket card is shown with movie name, seats, showtime, and a QR-style booking ID

---

## Environment Variables

### Server `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_key
```

---

## Build Order (Recommended)

1. **Backend foundation** — MongoDB connection, User model, JWT auth routes (register / login / refresh token)
2. **Theatre & Movie APIs** — Theatre model, Theatre Admin routes, Movie CRUD scoped to `theatreId`
3. **Seat & Showtime APIs** — Showtime model, seat map generation, seat locking endpoints
4. **Socket.io** — Real-time seat lock/unlock/booked events per showtime room
5. **React frontend** — Auth context, login/register pages, movie listing, showtime selector
6. **Seat Picker UI** — 3D CSS hall, seat grid, real-time updates via Socket.io
7. **Razorpay integration** — Order creation on server, payment verification, booking confirmation
8. **Theatre Admin dashboard** — Layout builder, movie management, booking analytics
9. **Super Admin dashboard** — Theatre approval, platform stats
10. **Polish** — Animated digital ticket, seat heatmap, booking history, deploy to Vercel + Render

---

## Key Differentiators (What Makes CineSphere Unique)

- 3D perspective cinema hall — no mainstream booking site does this
- Real-time seat locking via Socket.io — seats visually lock as others select them
- True multi-tenancy — any theatre can onboard and run independently
- Animated digital ticket card generated on successful booking
- Theatre Admin can configure their own hall layout and VIP zones
- Seat heatmap overlay (optional) — colour gradient showing popular/best-rated seats

---

*Built with React + Node.js + MongoDB + Socket.io + Razorpay*
*Project: CineSphere — Multi-tenant Cinema Ticket Booking Platform*
