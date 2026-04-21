# CineSphere Backend

Express.js + MongoDB server for cinema seat booking with JWT authentication and Socket.io real-time updates.

## Setup

### Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cinesphere
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### MongoDB Connection

**Using MongoDB Atlas:**

1. Create a free account at [mongodb.com](https://www.mongodb.com)
2. Create a cluster
3. Get connection string and add to `.env`

**Using MongoDB Compass (Local):**

1. Install MongoDB Community Edition
2. Run: `mongod`
3. Use connection string: `mongodb://localhost:27017/cinesphere`
4. Open MongoDB Compass to visualize data

### Running the Server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint    | Description          |
| ------ | ----------- | -------------------- |
| POST   | `/register` | Register new user    |
| POST   | `/login`    | Login user           |
| POST   | `/refresh`  | Refresh access token |
| POST   | `/logout`   | Logout user          |

### Models

- **User** - Authentication & user data
- **Movie** - Movie information & metadata
- **Showtime** - Show times with venue details
- **Seat** - Individual seats with status tracking (TTL index for auto-unlock)
- **Booking** - User bookings with payment info

## Features

✅ **JWT Authentication**

- Access token (15 min expiry) in response body
- Refresh token (7 days) in httpOnly cookie
- Token refresh endpoint

✅ **MongoDB Integration**

- Mongoose ODM with validation
- Indexes for performance
- TTL index for auto-releasing locked seats

✅ **Error Handling**

- Validation errors
- Duplicate key handling
- JWT error handling

## MongoDB Compass

**To use MongoDB Compass:**

1. Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017` (local) or paste your Atlas URI
3. Browse collections, create indexes, view/edit documents visually

## Next Steps

- [ ] Week 2 - Movie, Showtime, Seat, and Booking APIs
- [ ] Week 2 - Socket.io real-time seat locking
- [ ] Week 4 - Razorpay payment integration
