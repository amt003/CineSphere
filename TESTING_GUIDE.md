# CineSphere E2E Testing Guide

## Pre-Testing Checklist

### Backend Setup

```bash
# 1. Start MongoDB (verify connection string in .env)
# Connection: ac-1kftwjb-shard-00-00.um8ee5q.mongodb.net/cinesphere

# 2. Verify .env has all required variables
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
SENDGRID_API_KEY=your_sendgrid_key
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# 3. Start backend server
cd server
npm install  # if not done
npm start
# Expected: "🎬 CineSphere Server running on http://localhost:5000"
```

### Frontend Setup

```bash
# 1. Install dependencies (if needed)
cd client
npm install

# 2. Start development server
npm run dev
# Expected: "Local: http://localhost:5173"
```

---

## Test Scenario 1: Theatre Admin Registration & Setup

### Steps:

1. **Navigate to Theatre Registration**
   - Open `http://localhost:5173`
   - Click "Theatre Admin" or go to `/admin/register`

2. **Fill Registration Form**
   - Theatre Name: "Test Cinema Hall"
   - Location: "New York"
   - Admin Email: "admin@testcinema.com"
   - Password: "Admin@123"
   - **Number of Screens: 5** ← Critical field

3. **Verify in Database**

   ```bash
   # In MongoDB Atlas
   db.theatres.findOne({name: "Test Cinema Hall"})
   # Check: numberOfScreens should be 5
   ```

4. **Login & Access Admin Dashboard**
   - Email: admin@testcinema.com
   - Password: Admin@123
   - Verify: Dashboard shows theatre statistics

---

## Test Scenario 2: Multi-Screen Showtime Creation

### Steps:

1. **Navigate to Create Showtime**
   - Admin Dashboard → "Create Showtime" or `/admin/create-showtime`

2. **Verify Screen Selector Buttons**
   - Should see 5 buttons: Screen 1, Screen 2, Screen 3, Screen 4, Screen 5
   - Each button is clickable

3. **Create First Showtime**
   - Select: Screen 1
   - Movie: (select from dropdown)
   - Date: Tomorrow
   - Time: 10:00 AM
   - Click: "Create Showtime"
   - Expected: ✅ Success message

4. **Attempt Conflict Creation (Same Screen)**
   - Try to create showtime on Screen 1
   - Same date, time: 10:15 AM (within 2.5 hours)
   - Expected: ❌ 409 Conflict error "Time slot conflicts with another showtime on the same screen"

5. **Create Non-Conflicting Showtime**
   - Screen 1: 1:00 PM (3 hours later) → ✅ Should work
   - Screen 2: 10:00 AM (same time as Screen 1) → ✅ Should work (different screen)

6. **View All Showtimes**
   - Go to: `/admin/showtimes`
   - Verify: Showtimes grouped by screen with proper headings
   - Example:

     ```
     Screen 1
     - Movie A, 10:00 AM
     - Movie B, 1:00 PM

     Screen 2
     - Movie A, 10:00 AM
     ```

---

## Test Scenario 3: Complete Booking Flow

### Setup:

- Have at least 1 confirmed showtime

### Steps:

1. **Customer Login**
   - Open `http://localhost:5173`
   - Create new customer account OR login with existing
   - Email: customer@test.com
   - Password: Customer@123

2. **Browse Movies**
   - Navigate: `/browse`
   - See list of theatres and showtimes

3. **Select Showtime**
   - Click on a movie with available showtime
   - Select theatre and showtime

4. **Seat Selection (Critical Test)**
   - Navigate: `/booking/:showtimeId`
   - Verify UI elements:
     - [ ] Screen display at top
     - [ ] Seat grid (8 rows × 14 seats)
     - [ ] Row labels A-H
     - [ ] Seat legend (Available, VIP, Selected, Locked, Booked)
     - [ ] VIP rows highlighted (A-B by default)
     - [ ] Price summary below

   - **Test Seat Selection**:
     - Click available seat → Should become cyan/selected
     - Click VIP seat (Row A) → Should be amber but selectable
     - Click booked seat (red) → Should be disabled
     - Deselect seat → Should return to available

   - **Test Pricing**:
     - Select Standard seat (Row C): Should show 150₹
     - Select VIP seat (Row A): Should show 250₹
     - Total = (Standard × qty) + (VIP × qty)

   - **Select 3 Seats**: 1 VIP + 2 Standard
     - Expected total: 250 + 150 + 150 = 550₹

5. **Create Booking**
   - Click: "Proceed to Payment"
   - System should verify:
     - [ ] Booking window (2+ hours before showtime)
     - [ ] Seats not already locked
     - [ ] Create booking record with "pending" status

6. **Payment Processing**
   - Navigate: `/payment/:bookingId`
   - Verify display:
     - Booking ID
     - Selected seats (3 seats)
     - Price breakdown
     - Total: ₹550

   - **Test Razorpay Integration**:
     - Click: "Pay ₹550 Now"
     - Razorpay modal should open
     - Prefill data should show:
       - Customer name
       - Customer email
       - Phone number (if available)

7. **Complete Payment**
   - Use Razorpay Test Credentials:
     - Card: 4111 1111 1111 1111
     - Expiry: Any future month/year
     - CVV: Any 3 digits
     - OTP: Any value

   - Expected flow:
     - Payment processes
     - Backend verifies signature
     - Booking status changes to "confirmed"
     - Seats marked as "booked"
     - Redirect to `/tickets`
     - Success toast: "Payment completed!"

---

## Test Scenario 4: Real-Time Seat Locking (Socket.io)

### Setup:

- Have 2 browser windows/tabs open on same showtime booking page
- Both are logged-in customers

### Steps:

1. **Window 1: Select and Lock Seats**
   - Select seats: A1, A2, A3
   - Observe: Seats become cyan (selected)
   - Expected: Socket.io emits "lock-seats" event

2. **Window 2: See Locked Seats**
   - Observe: Seats A1, A2, A3 should show as "locked" (yellow)
   - Try clicking locked seat
   - Expected: Alert or tooltip "Being selected by another user"

3. **Window 1: Deselect Seats**
   - Click to deselect: A2
   - Expected: Socket.io emits "unlock-seats" for A2

4. **Window 2: See Unlocked Seat**
   - Observe: Seat A2 returns to "available" (gray)
   - Window 1 can now click A2
   - Expected: Socket.io emits "lock-seats" for new selection

### Verification:

- Open DevTools → Network → WS (WebSocket tab)
- Should see messages:
  ```
  join-showtime
  lock-seats
  unlock-seats
  user-joined
  seats-locked
  seats-unlocked
  ```

---

## Test Scenario 5: Customer My Tickets Page

### Steps:

1. **Navigate to Tickets**
   - Customer portal → "My Tickets" or `/tickets`

2. **Filter by Status**
   - Click: "All" → Show all bookings
   - Click: "Confirmed" → Show only confirmed
   - Click: "Pending" → Show only pending/uncompleted
   - Click: "Cancelled" → Show only cancelled

3. **Verify Booking Card**
   - Display: Movie title
   - Display: Status badge (green for confirmed)
   - Display: Booking ID (last 8 chars)
   - Display: Theatre name
   - Display: Number of seats
   - Display: Total amount

4. **Test Actions** (if confirmed):
   - Download: "Download ticket" button
   - Share: "Share booking" → Copy booking link
   - Cancel: (if pending) "Cancel" button → Should update status

---

## Test Scenario 6: Theatre Admin Analytics

### Steps:

1. **Navigate to Analytics**
   - Admin Dashboard → "Analytics" or `/admin/analytics`

2. **Verify Dashboard Cards**
   - [ ] Total Bookings (count)
   - [ ] Total Revenue (₹ amount)
   - [ ] Active Showtimes (count)
   - [ ] Occupancy Rate (percentage)

3. **Verify Data Accuracy**
   - Total Bookings should match count of confirmed bookings
   - Total Revenue should = sum of all booking.totalPrice
   - Active Showtimes = count of showtimes on today/future dates
   - Occupancy Rate = (booked seats / total seats) × 100

4. **Charts** (if implemented):
   - Revenue trends by week
   - Occupancy by showtime
   - Booking timeline

---

## Test Scenario 7: Hall Layout Configuration

### Steps:

1. **Navigate to Layout Manager**
   - Admin Dashboard → "Manage Layout" or `/admin/layout`

2. **Current Configuration**
   - Rows: 8 (A-H)
   - Seats per Row: 14
   - VIP Rows: A, B
   - Aisle After: Seat 7

3. **Modify Layout** (Optional)
   - Change rows: 10
   - Change seats per row: 16
   - Toggle VIP rows: Remove B, add C
   - Toggle aisle: After seat 8

4. **Save and Verify**
   - Click: "Save Layout"
   - Success toast
   - Refresh CreateShowtime → Screen buttons should reflect new config

---

## Debugging Commands

### Check MongoDB Connection

```bash
# In MongoDB Atlas -> Network Access
# Verify IP is whitelisted (0.0.0.0/0 for development)
```

### Check Razorpay Configuration

```bash
# Verify keys in .env
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
```

### Check Socket.io Connection

```javascript
// In browser console
console.log(io); // Should be available
io.connect(); // Should establish connection
```

### View Backend Logs

```bash
# In terminal running npm start
# Look for:
# ✅ Connection established
# ✅ Order created
# ✅ Payment verified
# ✅ Seats locked/unlocked
```

### Database Queries for Verification

```javascript
// Check theatre
db.theatres.findOne({ name: "Test Cinema Hall" });

// Check booking
db.bookings.findOne({ status: "confirmed" });

// Check seats
db.seats.find({ showtimeId: "xxx" });

// Check payment
db.payments.findOne({ status: "captured" });
```

---

## Common Issues & Solutions

### Issue: Seats don't lock in real-time

- **Check**: Socket.io connection (DevTools → Network → WS)
- **Check**: Backend logs for "initializeSeatLocking"
- **Fix**: Restart backend server

### Issue: Payment fails with "Order not found"

- **Check**: Razorpay API keys in .env
- **Check**: Amount conversion (paise vs rupees)
- **Fix**: Verify RAZORPAY_KEY_ID is test key

### Issue: Conflict detection not working

- **Check**: Showtime screen field is set
- **Check**: Theatre numberOfScreens is configured
- **Fix**: Run migration script: `node server/scripts/updateTheatreScreens.js`

### Issue: CORS error

- **Check**: Frontend port (5173 or 5174)
- **Fix**: Update allowedOrigins in server/index.js

---

## Performance Checks

### Response Time

- GET /api/bookings/my: < 200ms
- POST /api/payments/verify: < 500ms
- GET /api/seats: < 100ms

### Database Indexes

```javascript
// Verify indexes exist
db.showtimes.getIndexes();
// Should show: theatreId_1_screen_1_date_1_time_1

db.bookings.getIndexes();
// Should show: customerId_1, theatreId_1
```

---

## Sign-Off Checklist

- [ ] All 7 test scenarios pass
- [ ] No console errors (DevTools)
- [ ] Socket.io events logged correctly
- [ ] Payment signature validates
- [ ] Database records created accurately
- [ ] Booking status flows correctly
- [ ] Theatre admins can create multi-screen showtimes
- [ ] Customers can select seats and book
- [ ] Analytics dashboard shows real data

**Ready for Production**: When all checkboxes are checked ✅
