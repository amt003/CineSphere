# 🎯 Real-World Email Monitoring During User Actions

## Overview

Monitor emails sent during **actual user actions** on the website in real-time. This tracks when customers register, book tickets, and when theatre admins complete workflows.

---

## 🚀 Quick Start

### Step 1: Start the Real-World Monitor

```bash
cd server
node scripts/realWorldEmailMonitor.js
```

**Expected Output:**

```
════════════════════════════════════════════════════════════════════════════════
🚀 STARTING REAL-WORLD EMAIL MONITORING
════════════════════════════════════════════════════════════════════════════════

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

👀 Starting real-time monitors...

👤 MONITORING CUSTOMER REGISTRATIONS...
🏢 MONITORING THEATRE REGISTRATIONS...
✅ MONITORING THEATRE APPROVALS/REJECTIONS...
🎟️  MONITORING BOOKING CONFIRMATIONS...

✨ Monitors active! Waiting for user actions...
```

### Step 2: Open the Application in Another Window

```bash
# In another terminal
cd client
npm run dev
# Navigate to: http://localhost:5173
```

### Step 3: Perform User Actions

Monitor script will detect and log each action with **exact timestamp** of when email should arrive.

---

## 📊 Tracked User Actions & Email Triggers

### 1️⃣ **Customer Registration**

**What triggers it:**

- New customer creates account at `/` (Customer Login page)

**Email sent:**

- "Welcome to CineSphere!"
- To: New customer email

**Monitoring output:**

```
✅ NEW CUSTOMER DETECTED
   📧 Email: john@example.com
   👤 Name: John Doe
   🕐 Created: 10:30:45.123 AM
   ⏱️  Expected email delay: 1000ms
   ✉️  Expected email sent around: 10:30:46.123 AM
```

**What to do:**

1. Go to website → Create customer account
2. Monitor shows registration detected
3. Check your inbox for welcome email
4. Verify it arrived around the expected time

---

### 2️⃣ **Theatre Registration**

**What triggers it:**

- Theatre admin creates account at `/admin/register`

**Email sent:**

- "Theatre Registration Received"
- To: Theatre admin email

**Monitoring output:**

```
✅ NEW THEATRE DETECTED
   🏢 Name: PVR Cinemas
   📍 Location: Mumbai
   🕐 Created: 10:31:15.456 AM
   ⏱️  Expected email delay: 1000ms
   ✉️  Expected email sent around: 10:31:16.456 AM
```

**What to do:**

1. Go to `/admin/register` → Register theatre
2. Monitor detects registration
3. Check email for registration confirmation
4. Verify timing matches expected

---

### 3️⃣ **Theatre Approved** ✅

**What triggers it:**

- Super admin approves pending theatre (Super Admin Portal)

**Email sent:**

- "Your Theatre is Approved!"
- To: Theatre admin email

**Monitoring output:**

```
✅ THEATRE STATUS CHANGED
   🏢 Name: PVR Cinemas
   📊 Status: pending → approved
   ⏱️  Expected approval email delay: 500ms
   ✉️  Approval email triggered
```

**What to do:**

1. Login as super admin `/superadmin/login`
2. Find pending theatre → Click "Approve"
3. Monitor detects status change
4. Check theatre admin's email for approval notice

---

### 4️⃣ **Theatre Rejected** ❌

**What triggers it:**

- Super admin rejects theatre (Super Admin Portal)

**Email sent:**

- "Application Status Update"
- To: Theatre admin email

**Monitoring output:**

```
✅ THEATRE STATUS CHANGED
   🏢 Name: Test Cinema
   📊 Status: pending → rejected
   ⏱️  Expected rejection email delay: 500ms
   ✉️  Rejection email triggered
```

**What to do:**

1. Login as super admin
2. Find pending theatre → Click "Reject"
3. Monitor logs rejection
4. Check email for rejection reason

---

### 5️⃣ **Booking Confirmation** 🎟️

**What triggers it:**

- Customer completes payment after booking

**Email sent:**

- "Your Booking is Confirmed!"
- To: Customer email

**Monitoring output:**

```
✅ BOOKING CONFIRMED
   🎟️  Booking ID: 12345678
   👤 Customer: Jane Smith
   📧 Email: jane@example.com
   🎬 Movie: Oppenheimer
   💰 Amount: ₹550
   🕐 Confirmed: 10:45:30.789 AM
   ⏱️  Expected email delay: 2000ms
   ✉️  Confirmation email triggered
```

**What to do:**

1. Login as customer
2. Browse movies → Select showtime → Pick seats
3. Complete Razorpay payment
4. Monitor detects booking confirmation
5. Check email for booking details

---

## 📈 Live Dashboard

Every 10 seconds, the monitor displays:

```
════════════════════════════════════════════════════════════════════════════════
📧 REAL-WORLD EMAIL MONITORING DASHBOARD - LIVE TRACKING
════════════════════════════════════════════════════════════════════════════════
🕐 Time: 10:47:30.123 AM
📡 Monitoring Session Started: 10:30:00.000 AM

📊 ACTIVITY SUMMARY:
────────────────────────────────────────────────────────────────────────────────
👤 Customers Registered:      3
🏢 Theatres Created:          1
✅ Theatres Approved:         1
❌ Theatres Rejected:         0
🎟️  Bookings Confirmed:       2
────────────────────────────────────────────────────────────────────────────────
📧 Total Email Events:        7

📋 RECENT EMAIL EVENTS (Last 5):
────────────────────────────────────────────────────────────────────────────────
1. ✅ Customer Registration - 10:30:45.123 AM
2. ⏳ Theatre Registration - 10:31:15.456 AM
3. ✅ Theatre Approval - 10:32:00.000 AM
4. ✅ Booking Confirmation - 10:45:30.789 AM
5. ⏳ Booking Confirmation - 10:47:15.234 AM
```

---

## ⏱️ Expected Email Delays

| Action                | Expected Delay     | Notes                     |
| --------------------- | ------------------ | ------------------------- |
| Customer Registration | 1 second (1000ms)  | Immediate welcome email   |
| Theatre Registration  | 1 second (1000ms)  | Confirmation + next steps |
| Theatre Approval      | 500ms              | Super admin triggered     |
| Theatre Rejection     | 500ms              | Reason included           |
| Booking Confirmation  | 2 seconds (2000ms) | After payment processed   |

---

## 📋 Complete User Flow to Test All Emails

### Scenario 1: Full Customer Journey (5 emails total)

#### Timeline:

```
10:30:00 AM → Create Customer Account
10:30:01 AM → Email #1: Welcome email arrives
             (Customer Registration)

10:35:00 AM → Register Theatre (as admin)
10:35:01 AM → Email #2: Theatre registration confirmation
             (Theatre Registration)

10:40:00 AM → Super admin approves theatre
10:40:00.5 AM → Email #3: Theatre approved notification
               (Theatre Approval)

10:45:00 AM → Customer: Browse → Select Showtime → Pick Seats
10:45:30 AM → Complete Razorpay Payment
10:45:32 AM → Email #4: Booking confirmation arrives
             (Booking Confirmation)

10:50:00 AM → Customer: Make another booking & pay
10:50:32 AM → Email #5: Second booking confirmation
             (Booking Confirmation)
```

### Scenario 2: Rejection Flow (2 emails)

```
10:30:00 AM → Register Theatre (as admin)
10:30:01 AM → Email #1: Theatre registration confirmation

10:32:00 AM → Super admin rejects theatre
10:32:00.5 AM → Email #2: Theatre rejection notice
               (Theatre Rejection)
```

---

## 🔍 How to Verify Email Timing

### Step 1: Note Expected Time from Monitor

```
🕐 Created: 10:30:45.123 AM
⏱️  Expected email delay: 1000ms
✉️  Expected email sent around: 10:30:46.123 AM
```

### Step 2: Check Email Received Time

1. Open inbox
2. Click email
3. View → Show original (Gmail)
4. Look for "Date:" header

**Example:**

```
Date: Mon, 20 Apr 2026 10:30:46 +0000
```

### Step 3: Calculate Actual Delay

```
Sent Time: 10:30:46.123 AM
Received Time: 10:30:46.890 AM
Actual Delay: 767ms ✅ (Within expected 1000ms)
```

---

## 📊 Analyzing Results

### Expected vs Actual Timing

Create a comparison table:

| User Action       | Expected Email Time | Actual Receipt Time | Delay | Status  |
| ----------------- | ------------------- | ------------------- | ----- | ------- |
| Register Customer | 10:30:46 AM         | 10:30:47 AM         | 1s    | ✅ Good |
| Register Theatre  | 10:35:01 AM         | 10:35:02 AM         | 1s    | ✅ Good |
| Approve Theatre   | 10:40:00.5 AM       | 10:40:01 AM         | 0.5s  | ✅ Good |
| Confirm Booking   | 10:45:32 AM         | 10:45:34 AM         | 2s    | ✅ Good |

**Success Criteria:**

- ✅ Actual ≤ Expected delay
- ✅ All emails arrive in inbox
- ✅ No emails in spam
- ✅ Content is correct

---

## 📝 Log Files

### Real-World Event Log

```bash
cat server/logs/real-world-email-events.json
```

**Contains:**

```json
{
  "monitoringSession": {
    "startTime": "2026-04-20T10:30:00.000Z",
    "events": [
      {
        "eventId": "evt_1713607800000",
        "type": "CUSTOMER_REGISTRATION",
        "typeName": "Customer Registration",
        "userEmail": "john@example.com",
        "triggerTime": "2026-04-20T10:30:45.123Z",
        "expectedEmailTime": "2026-04-20T10:30:46.123Z",
        "status": "triggered",
        "emailSent": false,
        "verificationStatus": "pending"
      }
    ]
  }
}
```

---

## 🔧 Troubleshooting

### Issue: Monitor Shows Action But No Email Arrives

**Check:**

1. Email is in spam folder
2. Wrong email address
3. SENDGRID_API_KEY not set

**Fix:**

```bash
# Verify API key
echo $SENDGRID_API_KEY

# Check email logs
tail -f server/logs/debug.log | grep -i email
```

### Issue: Email Arrives Very Late (> 10 seconds)

**Possible Causes:**

1. SendGrid API rate limiting
2. Network delay
3. Email provider queuing

**Monitor:**

1. Check SendGrid dashboard
2. Verify API limits not exceeded
3. Check network connectivity

### Issue: No Activities Detected in Monitor

**Check:**

1. Database connected
2. Users/theatres/bookings created successfully
3. Monitor still running

**Verify:**

```bash
# In another terminal
node -e "
  import('./config/db.js').then(async ({connectDB}) => {
    await connectDB();
    const User = (await import('./models/User.js')).default;
    const count = await User.countDocuments();
    console.log('Total users:', count);
    process.exit(0);
  });
"
```

---

## 📊 Performance Metrics to Track

| Metric                              | Expected | Your Result |
| ----------------------------------- | -------- | ----------- |
| Registration → Welcome Email        | < 1s     | \_\_\_      |
| Theatre Registration → Confirmation | < 1s     | \_\_\_      |
| Approval → Email                    | < 500ms  | \_\_\_      |
| Payment → Booking Confirmation      | < 2s     | \_\_\_      |
| Email Reliability                   | 100%     | \_\_\_%     |

---

## 🎯 Success Criteria

**Real-world email monitoring is working when:**

- ✅ Monitor detects all user actions in real-time
- ✅ Email triggers logged with exact timestamps
- ✅ All emails arrive in inbox
- ✅ Arrival time matches expected delay (±500ms)
- ✅ Email content is accurate and formatted correctly
- ✅ No emails missing or duplicated
- ✅ Works across multiple concurrent users

---

## 📞 Support Commands

```bash
# 1. Start real-world monitor
node server/scripts/realWorldEmailMonitor.js

# 2. View event log (JSON)
cat server/logs/real-world-email-events.json | jq

# 3. View specific event details
cat server/logs/real-world-email-events.json | jq '.monitoringSession.events[0]'

# 4. Count events by type
cat server/logs/real-world-email-events.json | jq '[.monitoringSession.events[].type] | group_by(.) | map({type: .[0], count: length})'

# 5. Check sending performance
cat server/logs/real-world-email-events.json | jq '.monitoringSession.summary'
```

---

## 💡 Advanced Monitoring

### Monitor Multiple Concurrent Users

1. Open multiple browser windows
2. Each user creates account, books tickets
3. Monitor will track all emails in parallel
4. Verify system handles concurrent load

### Monitor Booking Surge

1. Create multiple customers
2. Have each complete booking simultaneously
3. Monitor email queue handling
4. Verify no emails are dropped

### Monitor Error Scenarios

1. Disable SendGrid API key temporarily
2. Monitor should log failures
3. Re-enable and verify recovery

---

**Status**: ✅ **Ready for Real-World Testing**

Start monitoring and perform actual user actions to verify emails are delivered during real workflows!
