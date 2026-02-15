# 🐛 Email Alert System - Debugging & Testing Guide

## 🔍 Issues Found and Fixed

### Issue 1: Risk Level Never Set to CRITICAL
**Problem:** The system only checked for HIGH risk, never CRITICAL
- Old code set riskLevel based on: `projectedCashAfterPayments < 0` → HIGH
- But never calculated riskScore which could indicate CRITICAL risk (score ≥ 75)

**Fix:** 
- Now calculates riskScore FIRST (0-100 scale)
- Determines riskLevel based on riskScore:
  - CRITICAL: score ≥ 75 (🔴)
  - HIGH: score 50-74 (🟠)
  - MEDIUM: score 25-49 (🟡)
  - LOW: score < 25 (🟢)

### Issue 2: Missing Debug Logging
**Problem:** Couldn't track where emails failed
- No visibility into credential validation
- No logs for email sending process

**Fix:** Added detailed logging:
- Environment variable verification
- Email sending step-by-step logs
- Gmail error hints (helps identify App Password issues)
- Cooldown check logs
- Risk calculation logs

---

## ✅ Testing Steps

### Step 1: Verify Gmail Credentials

```powershell
cd c:\Users\hares\Desktop\SR-42-Invictus\backend
node test_gmail_creds.js
```

**Expected Output:**
```
✅ CONNECTION SUCCESSFUL
   User: harshitabhatia003@gmail.com
   Ready to send emails

📧 Sending test email...
✅ TEST EMAIL SENT
   MessageID: <12345@gmail.com>
```

**If it fails:**
- ❌ EAUTH error: Your App Password is wrong
  - Go to: https://myaccount.google.com/security
  - Regenerate a NEW 16-character App Password
  - Update .env: EMAIL_PASS=xxxx xxxx xxxx xxxx
  - Restart backend

---

### Step 2: Full Email Alert System Test

```powershell
cd c:\Users\hares\Desktop\SR-42-Invictus\backend
npm start
```

**In another terminal:**
```powershell
cd c:\Users\hares\Desktop\SR-42-Invictus\backend
node test_email_alerts.js
```

**This script will:**
1. ✓ Verify .env is loaded
2. ✓ Create test user with HIGH risk data
3. ✓ Calculate Payment Radar metrics
4. ✓ Trigger email alert
5. ✓ Check if email was sent

**Check server logs (npm start terminal) for:**
```
💰 Payment Radar Calculation: 
   riskScore: 65
   riskLevel: HIGH

🔍 [Email Alert Check] Starting for user: emailtest@example.com
   Risk Level: HIGH, Risk Score: 65
   isHighRisk (HIGH|CRITICAL): true
   ✓ Alert conditions MET - Will proceed to check cooldown

📧 [EMAIL SERVICE] Sending financial risk alert...
   To: emailtest@example.com
✅ EMAIL SENT SUCCESSFULLY!
```

---

### Step 3: Live Testing with Real Data

**Create high-risk scenario:**

1. Start backend:
```powershell
cd backend
npm start
```

2. Login to http://localhost:5173

3. Go to **Data Entry** page

4. Upload CSV with high expenses:
```csv
Date,Category,Amount,Description
2026-02-15,Rent,100000,Monthly Rent
2026-02-16,Utilities,50000,Electricity and water
2026-02-17,Salaries,150000,Staff salaries
```

5. Go to **Payment Radar** - Should show HIGH/CRITICAL risk

6. **Check your email** (harshitabhatia003@gmail.com):
   - Wait 5-10 seconds
   - Look for: ⚠️ Financial Risk Alert - Vyapaar Sathi
   - Check SPAM folder if not in Inbox

---

## 🔧 Troubleshooting

### ❌ "No email sent" / Status is undefined

**Likely cause:** Expense status or dueDate not set

**Fix:** When creating expenses via API, ensure:
```javascript
{
  ownerId: userId,
  title: "...",
  amount: 50000,
  status: "Pending",      // ← MUST be "Pending"
  dueDate: new Date(),    // ← MUST have due date
  category: "..."
}
```

---

### ❌ "EMAIL_USER not configured" / "EMAIL_PASS not configured"

**Cause:** .env file not loaded or missing

**Fix:**
```bash
# Check .env exists
cat c:\Users\hares\Desktop\SR-42-Invictus\.env
# OR
type c:\Users\hares\Desktop\SR-42-Invictus\.env
```

Should show:
```env
EMAIL_USER=harshitabhatia003@gmail.com
EMAIL_PASS=kpudsywgioqasaoi
```

---

### ❌ Gmail says "invalid login"

**Cause:** Using regular Gmail password instead of App Password

**Fix:**
1. Go to: https://myaccount.google.com/security
2. Click **App passwords**
3. Select: Mail → Windows Computer
4. Copy 16-character password
5. Update .env:
   ```env
   EMAIL_PASS=abcd efgh ijkl mnop
   ```
6. Restart backend

**Important:** The password has SPACES, don't remove them!

---

### ❌ Second email not sent

**Cause:** 24-hour cooldown is active

**Expected behavior!** The system prevents spam by only sending 1 email every 24 hours.

**Check logs for:**
```
⏱️ Cooldown active: 0/24 hours elapsed
```

**To test again immediately:**
1. Wait 24+ hours, OR
2. Manually update database:
   ```javascript
   // In MongoDB
   db.users.updateOne(
     { email: "emailtest@example.com" },
     { $set: { lastAlertSent: null } }
   );
   ```
3. Call Payment Radar API again

---

### ❌ Email received but data is wrong

**Check:** Look at the email data vs Payment Radar API response

Run this to capture full response:
```powershell
$token = "YOUR_TOKEN"
$headers = @{ "Authorization" = "Bearer $token" }
$res = Invoke-WebRequest -Uri "http://localhost:5000/api/dashboard/payment-radar" -Headers $headers
$res.Content | ConvertFrom-Json | ConvertTo-Json -Depth 20
```

Compare email values with API response and report any discrepancies.

---

## 📊 Expected Email Content

When HIGH/CRITICAL alert is sent, email contains:

- ✅ Your name
- ✅ Business name
- ✅ Current Cash amount
- ✅ Projected Cash (with color: red if negative)
- ✅ Risk Score (0-100)
- ✅ Risk Level (HIGH or CRITICAL)
- ✅ Number of overdue invoices
- ✅ Overdue amount pending
- ✅ Upcoming payments due
- ✅ AI explanation (why risk is high)
- ✅ Suggested action (what to do)
- ✅ Link to Payment Radar in app

---

## 🎯 Quick Verification Checklist

- [ ] .env contains EMAIL_USER and EMAIL_PASS
- [ ] EMAIL_PASS is 16 characters (from Gmail App Passwords, not regular password)
- [ ] Gmail 2FA is enabled
- [ ] Backend is running (npm start)
- [ ] Test user has emailNotificationsEnabled = true
- [ ] Test user has high-risk expenses (total > 100,000)
- [ ] Payment Radar shows riskLevel = HIGH or CRITICAL
- [ ] Server logs show "EMAIL SENT SUCCESSFULLY"
- [ ] Email arrives in inbox (or spam folder)
- [ ] Second alert blocked by cooldown within 24 hours

---

## 📞 Support

If emails still don't work:

1. **Check server logs** (npm start terminal) - copy full error message
2. **Run test_gmail_creds.js** - verify Gmail works
3. **Verify .env** - ensure EMAIL_USER and EMAIL_PASS are correct
4. **Check Gmail settings** - ensure 2FA enabled, App Password generated
5. **Look for firewall** - ensure port 587 (SMTP) is not blocked

---

## 📝 Log Examples

### ✅ Successful Email Send

```
💰 Payment Radar Calculation for emailtest@example.com:
   currentCash: 50000
   projectedCashAfterPayments: -299700
   avgDailySales: 5000
   riskScore: 85
   riskLevel: CRITICAL
   overdueCount: 0
   upcomingCount: 3

🔍 [Email Alert Check] Starting for user: emailtest@example.com
   emailNotificationsEnabled: true
   Risk Level: CRITICAL, Risk Score: 85
   isHighRisk (HIGH|CRITICAL): true
   ✓ Alert conditions MET - Will proceed to check cooldown

📧 [EMAIL SERVICE] Sending financial risk alert...
   To: emailtest@example.com
   From: harshitabhatia003@gmail.com
   ✓ Transporter created
   ✓ HTML template generated (3847 bytes)
   ✓ Mail options prepared, sending via SMTP...

✅ EMAIL SENT SUCCESSFULLY!
   Email Details:
      to: emailtest@example.com
      messageId: <CAMxxxxxxxxxxx@gmail.com>
      riskLevel: CRITICAL
      timestamp: 2026-02-15T10:30:45.123Z
```

### ❌ Failed Email Send (Wrong Password)

```
❌ FAILED TO SEND EMAIL
   Error Details:
      message: "Invalid login - full authentication is required."
      code: "EAUTH"
      userEmail: emailtest@example.com

💡 HINT: Gmail authentication failed. Check EMAIL_PASS (should be 16-char App Password, not regular password)
```

---

Done! Run the test and check your email! 📧
