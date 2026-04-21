# CineSphere Deployment Checklist

## Phase 1: Environment Configuration

### Step 1.1: Backend Environment Variables

Create `.env` file in `server/` directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@ac-1kftwjb-shard-00-00.um8ee5q.mongodb.net/cinesphere

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173

# Authentication
JWT_SECRET=<generate_strong_random_secret>
REFRESH_TOKEN_SECRET=<generate_strong_random_secret>

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>

# Email Service (SendGrid)
SENDGRID_API_KEY=<your_sendgrid_api_key>
SENDGRID_FROM_EMAIL=noreply@cinesphere.com

# Optional: Super Admin Credentials
SUPER_ADMIN_EMAIL=superadmin@cinesphere.com
SUPER_ADMIN_PASSWORD=<generate_strong_password>
```

### Step 1.2: Frontend Environment Variables

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Step 1.3: MongoDB Atlas Configuration

1. **Whitelist IP Address**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (for development)
   - For production: Add specific IP addresses

2. **Create Database User**
   - Username: `cinesphere_user`
   - Password: Use strong password
   - Roles: Read/Write to database

3. **Get Connection String**
   ```
   mongodb+srv://cinesphere_user:<password>@ac-1kftwjb-shard-00-00.um8ee5q.mongodb.net/cinesphere?retryWrites=true&w=majority
   ```

---

## Phase 2: Database Setup

### Step 2.1: Initialize Collections

```bash
# Collections are auto-created by Mongoose on first write
# Run migration script to initialize data:

cd server
node scripts/updateTheatreScreens.js
# Expected: "✅ Updated X theatres with numberOfScreens"
```

### Step 2.2: Create Indexes

```bash
# Indexes are auto-created by Mongoose schema definitions
# Verify indexes in MongoDB:

db.showtimes.createIndex({ theatreId: 1, screen: 1, date: 1, time: 1 })
db.bookings.createIndex({ customerId: 1, theatreId: 1 })
db.seats.createIndex({ showtimeId: 1, seatId: 1 })
```

### Step 2.3: Seed Initial Data (Optional)

```bash
# Create test theatres
db.theatres.insertMany([
  {
    name: "PVR Cinemas",
    location: "Mumbai",
    numberOfScreens: 5,
    status: "approved",
    hallLayout: {
      rows: 8,
      seatsPerRow: 14,
      vipRows: ["A", "B"]
    }
  }
])

# Create test movies
db.movies.insertMany([
  {
    title: "Inception",
    genre: "Sci-Fi",
    duration: 148,
    releaseDate: new Date(),
    posterUrl: "https://...",
    theatreId: <theatre_id>
  }
])
```

---

## Phase 3: Third-Party Services

### Step 3.1: Razorpay Setup

1. **Create Account**
   - Go to: https://razorpay.com
   - Sign up with business email

2. **Generate API Keys**
   - Dashboard → Settings → API Keys
   - Copy: Key ID (public)
   - Copy: Key Secret (private) ← Keep secret!
   - Add to `.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

3. **Test Credentials** (for development)
   - Test Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: Autofill

4. **Enable Features**
   - Dashboard → Settings → Webhooks
   - Add endpoint for payment notifications (optional)

### Step 3.2: SendGrid Setup (Email)

1. **Create Account**
   - Go to: https://sendgrid.com
   - Sign up

2. **Generate API Key**
   - Settings → API Keys
   - Create new key with Mail Send access
   - Add to `.env` as `SENDGRID_API_KEY`

3. **Verify Sender Email**
   - Settings → Sender Authentication
   - Add your domain or use default email

### Step 3.3: JWT Secrets Generation

```bash
# Generate strong random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice to get JWT_SECRET and REFRESH_TOKEN_SECRET
```

---

## Phase 4: Application Setup

### Step 4.1: Backend Setup

```bash
cd server

# Install dependencies
npm install

# Verify database connection
node -e "
  import('./config/db.js').then(({connectDB}) => {
    connectDB().then(() => {
      console.log('✅ Database connected');
      process.exit(0);
    });
  });
"

# Start server
npm start
# Expected output:
# 🎬 CineSphere Server running on http://localhost:5000
# 📡 CORS enabled for http://localhost:5173
# ⚡ Socket.io WebSocket enabled
# 🗄️ MongoDB connected
```

### Step 4.2: Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
# Expected output:
# Local: http://localhost:5173
```

### Step 4.3: Verify Services

```bash
# 1. Check backend health
curl http://localhost:5000/health
# Expected: {"message":"CineSphere server is running 🎬"}

# 2. Check frontend loads
curl http://localhost:5173
# Expected: HTML response

# 3. Check Socket.io
# Open http://localhost:5173 in browser
# DevTools → Network → WS tab
# Should see WebSocket connection
```

---

## Phase 5: Data Validation

### Step 5.1: Verify Models

```javascript
// In Mongosh or MongoDB Atlas terminal
// Check Theatre
db.theatres.findOne();
// Expected fields: name, location, numberOfScreens, hallLayout, pricing, status

// Check Booking
db.bookings.findOne();
// Expected fields: customerId, theatreId, movieId, seats, totalPrice, status

// Check Seats
db.seats.findOne();
// Expected fields: showtimeId, seatId, row, column, type, status
```

### Step 5.2: Test API Endpoints

```bash
# Test auth
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test theatres
curl http://localhost:5000/api/theatres

# Test health
curl http://localhost:5000/health
```

---

## Phase 6: Security Hardening

### Step 6.1: Frontend Security

- [ ] Enable HTTPS (install SSL certificate)
- [ ] Set secure CORS headers
- [ ] Implement CSP (Content Security Policy)
- [ ] Remove debug code/console.logs
- [ ] Minify and bundle assets

### Step 6.2: Backend Security

- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS only
- [ ] Use secure cookie flags
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set proper CORS origins (not localhost)
- [ ] Rotate JWT secrets regularly

### Step 6.3: Database Security

- [ ] Use strong passwords for MongoDB user
- [ ] Whitelist specific IP addresses (not 0.0.0.0)
- [ ] Enable encryption at rest
- [ ] Set automatic backups
- [ ] Create read-only user for analytics

### Step 6.4: Payment Security

- [ ] Never log payment data
- [ ] Use HTTPS for all payment endpoints
- [ ] Implement signature verification (already done)
- [ ] Store only Razorpay order/payment IDs
- [ ] Implement 3D Secure (if required)

---

## Phase 7: Monitoring & Logging

### Step 7.1: Backend Logging

```javascript
// Already implemented:
// - Auth: Login/registration logging
// - Payments: Order creation and verification
// - Bookings: Booking lifecycle events
// - Showtimes: Conflict detection
// - Socket.io: Connection and event logging

// Verify in server logs:
✅ User connected: [socket.id]
✅ Razorpay order created: [order.id]
✅ Payment verified: [payment.id]
✅ Seats locked: [seat.ids]
```

### Step 7.2: Error Handling

```javascript
// Error handler middleware logs:
// - Request: method, path, user
// - Error: message, stack trace
// - Response: status code

// Check server logs for:
❌ Error messages
❌ Database errors
❌ Payment failures
❌ Socket.io errors
```

### Step 7.3: Monitoring Dashboard

```bash
# Optional: Set up monitoring service
# - PM2 for process management
# - New Relic or DataDog for APM
# - Sentry for error tracking
```

---

## Phase 8: Production Deployment

### Step 8.1: Choose Hosting

**Backend Options:**

- Render.com (free tier available)
- Railway.app
- AWS EC2
- DigitalOcean

**Frontend Options:**

- Vercel (optimized for Vite)
- Netlify
- AWS S3 + CloudFront

### Step 8.2: Deploy Backend

```bash
# Example: Deploy to Render
# 1. Connect GitHub repository
# 2. Set environment variables
# 3. Set build command: npm install
# 4. Set start command: npm start
# 5. Deploy
```

### Step 8.3: Deploy Frontend

```bash
# Example: Deploy to Vercel
# 1. Connect GitHub repository
# 2. Set framework: Vite
# 3. Set environment: VITE_API_URL=https://api.cinesphere.com
# 4. Deploy
```

### Step 8.4: Update Configuration

```env
# Production .env
MONGODB_URI=mongodb+srv://prod_user:prod_pass@prod-cluster.mongodb.net/cinesphere
CLIENT_URL=https://cinesphere.com
PORT=5000
NODE_ENV=production

# HTTPS endpoints
API_URL=https://api.cinesphere.com
SOCKET_URL=https://api.cinesphere.com
```

---

## Phase 9: Post-Deployment

### Step 9.1: Verify Production

- [ ] All APIs responding
- [ ] Database synced
- [ ] Socket.io WebSocket working
- [ ] Payments processing
- [ ] Emails being sent
- [ ] Analytics dashboard showing data

### Step 9.2: Performance Optimization

```bash
# Backend
- Enable compression
- Implement caching
- Optimize database queries

# Frontend
- Lazy load routes
- Code splitting
- Image optimization
```

### Step 9.3: Backup Strategy

```bash
# MongoDB Atlas
- Enable automatic backups (daily)
- Download backups monthly
- Test restore process

# Source Code
- Regular git backups
- Use GitHub Actions for CI/CD
```

### Step 9.4: Maintenance Schedule

```
Daily: Monitor error logs, payment processing
Weekly: Check database performance, disk usage
Monthly: Update dependencies, security audit
Quarterly: Full system review, load testing
```

---

## Rollback Plan

### If Issues Occur

```bash
# 1. Stop current deployment
pm2 stop all

# 2. Revert to previous version
git checkout <previous_commit>

# 3. Restore previous database backup
mongodb restore --uri="..." --archive=backup.archive

# 4. Restart services
npm start
```

---

## Success Criteria

- ✅ Zero application errors in logs
- ✅ All API endpoints responding < 500ms
- ✅ Payment processing 100% success rate
- ✅ Socket.io real-time latency < 100ms
- ✅ Database queries < 200ms
- ✅ Customer bookings flowing correctly
- ✅ Admin dashboard showing accurate data

---

## Support & Troubleshooting

### Common Production Issues

**Issue**: "Cannot connect to database"

- Check MongoDB whitelist IPs
- Verify MONGODB_URI is correct
- Check network connectivity

**Issue**: "Payment fails"

- Verify Razorpay keys are correct
- Check payment amount conversion
- Review Razorpay logs

**Issue**: "Socket.io connection fails"

- Check SOCKET_URL configuration
- Verify CORS settings
- Check firewall rules

**Issue**: "High response time"

- Check database indexes
- Implement caching
- Scale horizontally if needed

---

**Deployment Date**: ****\_\_\_****
**Deployed By**: ****\_\_\_****
**Approval**: ****\_\_\_****
