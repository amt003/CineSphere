# 📧 CineSphere Email Inbox Verification Guide

## Monitoring Email Delivery During Specified Times

This guide helps you verify that emails are being sent to your inbox during the test window and track delivery status.

---

## 🚀 Quick Start - Test Email Delivery

### Step 1: Run Email Tests

```bash
cd server
node scripts/testEmailInbox.js
```

**Expected Output:**

```
============================================================
🧪 CINESPHERE EMAIL SERVICE TEST - INBOX VERIFICATION
============================================================

📧 Target Email: your-email@gmail.com
🕐 Test Started: April 20, 2026, 10:30:45 AM
📝 Log File: server/logs/email-test-log.json

────────────────────────────────────────────────────────────
1️⃣  Customer Registration Email
────────────────────────────────────────────────────────────
📤 Sending at: April 20, 2026, 10:30:45 AM
🔖 Email Type: customer_registration
📥 To: your-email@gmail.com
✅ Email sent successfully! (342ms)
```

### Step 2: Check Your Inbox

| Email | Subject                       | Arrival Time | Status       |
| ----- | ----------------------------- | ------------ | ------------ |
| 1     | Welcome to CineSphere!        | Check now ⏰ | ✅ Received? |
| 2     | Theatre Registration Received | Check now ⏰ | ✅ Received? |
| 3     | Theatre Approved!             | Check now ⏰ | ✅ Received? |
| 4     | Application Status Update     | Check now ⏰ | ✅ Received? |
| 5     | Your Booking is Confirmed!    | Check now ⏰ | ✅ Received? |

### Step 3: Record Delivery Times

Create a tracking table like this:

```
Email Type          | Sent Time      | Received Time   | Delay    | Status
────────────────────────────────────────────────────────────────────────────
Customer Reg        | 10:30:45 AM    | 10:30:52 AM     | 7 sec    | ✅
Theatre Reg         | 10:31:00 AM    | 10:31:08 AM     | 8 sec    | ✅
Theatre Approval    | 10:31:15 AM    | 10:31:25 AM     | 10 sec   | ✅
Theatre Rejection   | 10:31:30 AM    | 10:31:38 AM     | 8 sec    | ✅
Booking Confirm     | 10:31:45 AM    | 10:31:53 AM     | 8 sec    | ✅
```

---

## 📊 Email Delivery Log

### Automatic Log File

After running tests, check: `server/logs/email-test-log.json`

**Sample Log:**

```json
{
  "tests": [
    {
      "runId": "run_1713607845000",
      "startTime": "2026-04-20T10:30:45.000Z",
      "testEmail": "your-email@gmail.com",
      "results": [
        {
          "testId": 1,
          "name": "Customer Registration",
          "type": "customer_registration",
          "status": "sent",
          "sentTime": "2026-04-20T10:30:45.123Z",
          "durationMs": 342,
          "verified": false,
          "verificationTime": null
        },
        {
          "testId": 2,
          "name": "Theatre Registration",
          "type": "theatre_registration",
          "status": "sent",
          "sentTime": "2026-04-20T10:31:00.456Z",
          "durationMs": 289,
          "verified": false,
          "verificationTime": null
        }
      ],
      "endTime": "2026-04-20T10:31:55.789Z",
      "summary": {
        "total": 5,
        "successful": 5,
        "failed": 0,
        "successRate": "100%"
      }
    }
  ],
  "summary": {
    "sent": 5,
    "failed": 0,
    "verified": 0
  }
}
```

---

## 🔍 Email Inbox Verification Checklist

### For Each Email Received:

#### Email 1: Customer Registration

- [ ] Arrived within 5-10 seconds of send time
- [ ] Contains greeting: "Welcome to CineSphere!"
- [ ] Includes customer name from registration
- [ ] Has CineSphere logo/branding
- [ ] Contains link to browse movies
- [ ] Professional HTML formatting
- [ ] From: `noreply@cinesphere.com`

#### Email 2: Theatre Registration

- [ ] Subject: "Theatre Registration Received"
- [ ] Includes theatre name
- [ ] Shows pending approval status
- [ ] Contains expected next steps
- [ ] Professional formatting

#### Email 3: Theatre Approval

- [ ] Subject: "Your Theatre is Approved!"
- [ ] Shows theatre name
- [ ] Includes admin dashboard link
- [ ] Congratulatory message
- [ ] Next steps for creating showtimes

#### Email 4: Theatre Rejection

- [ ] Subject: "Application Status Update"
- [ ] Shows rejection reason
- [ ] Includes resubmission instructions
- [ ] Professional tone

#### Email 5: Booking Confirmation

- [ ] Subject: "Your Booking is Confirmed!"
- [ ] Shows booking ID
- [ ] Lists selected seats
- [ ] Confirms theatre, movie, date, time
- [ ] Shows total amount paid
- [ ] Contains download ticket link

---

## ⏱️ Timing Verification

### Expected Email Delivery Speed

| Scenario              | Expected Delay | Acceptable Range |
| --------------------- | -------------- | ---------------- |
| Development (local)   | < 500ms        | < 1 second       |
| Production (SendGrid) | < 5 seconds    | 1-10 seconds     |
| During high load      | < 20 seconds   | 10-30 seconds    |

### How to Check Delivery Time

1. Note the **Sent Time** from script output
2. Check email **Received Time** in inbox headers
3. Calculate delay: `Received Time - Sent Time`

**Gmail Headers:**

- Right-click email → "Show original"
- Look for: `Date: Mon, 20 Apr 2026 10:30:52 +0000`

---

## 📱 Monitoring Real-Time Bookings

### When Customer Books (Production)

```javascript
// Email should arrive at specified times:

1. BOOKING CREATED (status: pending)
   - Send: "Booking Confirmation" email
   - Time: Immediately after booking

2. PAYMENT VERIFIED (status: confirmed)
   - Send: "Payment Received" email
   - Time: Immediately after payment success

3. BOOKING CANCELLED (status: cancelled)
   - Send: "Booking Cancelled" email
   - Time: Immediately after cancellation

// Monitor timing:
- Booking Created → Email Sent: Should be < 1 second
- Payment Verified → Email Sent: Should be < 1 second
- Cancellation → Email Sent: Should be < 1 second
```

---

## 🔧 Troubleshooting Email Issues

### Issue: Emails Not Arriving

**Check:**

1. `.env` file has `SENDGRID_API_KEY` set correctly
2. SendGrid account is active (not in trial or suspended)
3. Check spam/promotional folder
4. Verify email address is correct

**Fix:**

```bash
# Verify SendGrid API key
echo $SENDGRID_API_KEY

# Re-run tests
node scripts/testEmailInbox.js
```

### Issue: Emails Delayed (> 10 seconds)

**Check:**

1. SendGrid API rate limits
2. Network connectivity
3. SendGrid dashboard status
4. Email size (usually not an issue)

**Monitor:**

```bash
# Check SendGrid logs in dashboard
# Settings → Mail Send → Event Webhook
# Should see delivery events

# Or check backend logs
tail -f server/logs/debug.log | grep -i "email\|sendgrid"
```

### Issue: Wrong Email Address

**Fix:**

1. Update `TEST_EMAIL` in `.env`:
   ```env
   TEST_EMAIL=your-actual-email@gmail.com
   ```
2. Re-run tests

### Issue: Missing SMTP Configuration

**Check:**

```bash
# Verify SENDGRID_API_KEY is loaded
node -e "
  import('dotenv').then(d => {
    d.config();
    console.log('SendGrid Key:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  });
"
```

---

## 📈 Email Statistics

### Track Over Multiple Runs

```bash
# Check cumulative statistics
cat server/logs/email-test-log.json | jq '.summary'

# Output:
# {
#   "sent": 15,      # Total emails sent
#   "failed": 0,     # Total failures
#   "verified": 12   # Manually verified
# }
```

### Calculate Success Rate

```javascript
// In logs:
successRate = (successful / total) * 100

// Examples:
5/5 = 100% ✅ Perfect
5/5 = 100% ✅ All delivered
4/5 = 80% ⚠️ One failed (check logs)
0/5 = 0% ❌ All failed (check SENDGRID_API_KEY)
```

---

## 🔔 Scheduled Email Testing

### Automated Testing Script

Create `testEmailScheduled.js`:

```javascript
import schedule from "node-schedule";
import { execSync } from "child_process";

// Run email tests every hour
schedule.scheduleJob("0 * * * *", () => {
  console.log(`📧 Running scheduled email test at ${new Date()}`);
  try {
    execSync("node scripts/testEmailInbox.js", { stdio: "inherit" });
  } catch (err) {
    console.error("Email test failed:", err.message);
  }
});

console.log("⏰ Email testing scheduled hourly");
```

**Setup:**

```bash
npm install node-schedule
node testEmailScheduled.js
```

---

## 📋 Email Verification Checklist

- [ ] Run `node scripts/testEmailInbox.js`
- [ ] Check inbox for 5 emails
- [ ] Verify each email arrived within 10 seconds
- [ ] Confirm all emails have correct formatting
- [ ] Review email content accuracy
- [ ] Check sender address is correct
- [ ] Verify no emails in spam folder
- [ ] Review `email-test-log.json` for timing data
- [ ] Document all delivery times
- [ ] Mark success/failure for each test

---

## 📞 Support

### Common Questions

**Q: How long do emails take to arrive?**
A: Typically 1-5 seconds. If > 10 seconds, check SendGrid API status.

**Q: Can I test during high load?**
A: Yes. Run multiple test scripts in parallel to see how the system handles concurrent emails.

**Q: Where are emails logged?**
A: `server/logs/email-test-log.json` - JSON format with timestamps and status.

**Q: How do I verify real customer emails?**
A: Check booking confirmation emails when actual bookings are made through the platform.

**Q: What if some emails fail?**
A: Log file will show which ones failed. Check error messages and verify SendGrid configuration.

---

## ✅ Success Criteria

**Email delivery is working correctly when:**

- ✅ All 5 test emails arrive in inbox
- ✅ Arrival time is within 5-10 seconds
- ✅ Email content is accurate and properly formatted
- ✅ Sender address is correct
- ✅ No emails in spam folder
- ✅ Log file shows 100% success rate

**Ready for production when:**

- ✅ Consistent delivery < 5 seconds
- ✅ Zero formatting issues
- ✅ Real customer emails verify successful
- ✅ No missed emails in multiple test runs

---

**Last Updated**: April 20, 2026  
**Email Service**: SendGrid  
**Log Location**: `server/logs/email-test-log.json`
