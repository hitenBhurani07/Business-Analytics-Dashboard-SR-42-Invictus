# Payment Radar Email Notifications - Implementation Guide

## Overview

This document explains the complete implementation of automatic email notifications for the Payment Radar feature. When a user's financial risk reaches **HIGH** or **CRITICAL** level, or when projected cash becomes **negative**, the system automatically sends a professional HTML email alert with a 24-hour cooldown to prevent spam.

---

## 📋 Requirements Implemented

✅ Backend-only implementation (Node.js + Express)
✅ Nodemailer for email delivery
✅ 24-hour cooldown using `lastAlertSent` field
✅ Professional HTML email template
✅ Environment variable configuration
✅ Production-ready error handling
✅ Modular, maintainable code

---

## 🏗️ Architecture Overview

### Email Notification Flow

```
User Transaction
        ↓
  [Payment Radar API]
        ↓
  Calculate Metrics
  - riskScore (0-100)
  - riskLevel (LOW/MEDIUM/HIGH/CRITICAL)
  - projectedCash
  - overdueInvoices
        ↓
  Evaluate Alert Conditions:
  ├─ riskLevel === "HIGH" OR "CRITICAL"
  └─ OR projectedCash < 0
        ↓
  If Conditions Met → Check Cooldown
  ├─ lastAlertSent field exists?
  ├─ Calculate: now - lastAlertSent
  └─ If < 24 hours → Skip, else continue
        ↓
  Prepare Email Data
  - User info
  - Financial metrics
  - Risk assessment
  - Suggested action
        ↓
  Send Email via Nodemailer
        ↓
  Update lastAlertSent timestamp
        ↓
  Return API Response (non-blocking)
```

---

## 📦 Components

### 1. User Model Update (`backend/models/User.js`)

**New Fields Added**:
```javascript
lastAlertSent: {
    type: Date,
    default: null,
    description: 'Timestamp of last financial risk alert sent'
},
emailNotificationsEnabled: {
    type: Boolean,
    default: true,
    description: 'Whether user wants email alerts'
}
```

**Purpose**: 
- `lastAlertSent`: Tracks the last time alert was sent (for 24-hour cooldown)
- `emailNotificationsEnabled`: Allows users to disable alerts if desired

---

### 2. Email Service (`backend/utils/emailService.js`)

#### Key Functions

##### `getTransporter()`
Creates a reusable Nodemailer transporter with Gmail SMTP configuration.

```javascript
const transporter = getTransporter();
// Returns configured transporter for sending emails
```

##### `generateFinancialAlertHTML(data)`
Generates professional HTML email template with:
- Header with Vyapaar Sathi branding
- Risk alert box (color-coded by risk level)
- Financial metrics dashboard (4 cards)
- Financial breakdown (Overdue, Upcoming, Total)
- Suggested action box
- CTA button to Payment Radar
- Professional footer

**Features**:
- Fully responsive design
- Color-coded risk indicators (🟡 WARNING / 🔴 CRITICAL)
- Professional styling with gradients
- Mobile-friendly layout

##### `sendFinancialRiskAlert(data)`
Main function that sends the alert email.

**Parameters**:
```javascript
{
    userEmail: string,          // Recipient email
    userName: string,           // User name for greeting
    businessName: string,       // Business name
    riskLevel: string,          // "HIGH" or "CRITICAL"
    riskScore: number,          // 0-100
    projectedCash: number,      // Projected cash amount
    currentCash: number,        // Current cash balance
    overdueCount: number,       // Number of overdue invoices
    overdueAmount: number,      // Total overdue amount
    upcomingAmount: number,     // Total upcoming payments
    topSuggestion: string,      // Suggested action
    aiExplanation: string       // AI-generated insight
}
```

**Returns**:
```javascript
{
    success: boolean,
    messageId?: string,         // Successful send
    error?: string              // Error message
}
```

**Error Handling**:
- Checks if email credentials are configured
- Catches SMTP errors gracefully
- Logs detailed error information
- Returns error object without throwing

---

### 3. Dashboard Controller Update (`backend/controllers/dashboardController.js`)

#### New Helper Function: `checkAndSendFinancialAlert(user, paymentRadarData)`

**Logic Flow**:

```javascript
1. Check if emailNotificationsEnabled === true
   └─ If false → Exit silently

2. Evaluate alert conditions:
   ├─ riskLevel === "HIGH" OR "CRITICAL"
   └─ OR projectedCash < 0
   └─ If neither → Exit (no alert needed)

3. Check 24-hour cooldown:
   ├─ Get lastAlertSent from user document
   ├─ Calculate time difference
   └─ If < 24 hours → Exit, return remaining cooldown time

4. Prepare email data:
   ├─ Extract top suggestion from actionSuggestions
   ├─ Gather all financial metrics
   └─ Create email payload

5. Send email:
   ├─ Call sendFinancialRiskAlert()
   ├─ Check result status
   └─ If successful:
       ├─ Update user.lastAlertSent = now
       ├─ Save user document
       └─ Log success

6. Error handling:
   └─ Log all errors without blocking API response
```

**Non-Blocking Execution**:
```javascript
checkAndSendFinancialAlert(user, responseData)
    .catch(err => console.error('Email error:', err));

res.json(responseData);  // Response sent immediately
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install nodemailer
```

### Step 2: Configure Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Factor Authentication** (if not already enabled)
3. Go to **App passwords** (appears after 2FA is enabled)
4. Select "Mail" and "Windows Computer"
5. Generate app password
6. Copy the 16-character app password

### Step 3: Set Environment Variables

Create or update `.env` file:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:5173
```

### Step 4: Update User Documents (Migration)

For existing user documents, add the new fields:

```javascript
// One-time migration (in MongoDB)
db.users.updateMany(
    {},
    {
        $set: {
            lastAlertSent: null,
            emailNotificationsEnabled: true
        }
    }
);
```

---

## 📧 Email Template Features

### Visual Design

**Header**:
- Purple gradient background
- Vyapaar Sathi branding
- Business name display

**Risk Alert Box**:
- Color changes based on risk level:
  - 🟡 **HIGH**: Orange (#FF9800)
  - 🔴 **CRITICAL**: Red (#F44336)
- Left border accent (thick colored line)
- AI-generated explanation message

**Metrics Dashboard** (4 Cards):
1. Current Cash (₹)
2. Projected Cash (₹) - Red if negative
3. Risk Score (0-100)
4. Overdue Invoices (count)

**Financial Breakdown**:
- Overdue Amount
- Upcoming Payments (next 3 days)
- Total Pending

**Suggested Action**:
- Green box with 💡 icon
- Top priority suggestion with description
- Actionable guidance

**CTA Button**:
- Links directly to Payment Radar page
- Styled with primary brand color
- Hover effects

### Example Email Structure

```
┌─────────────────────────────────────┐
│ 🚨 Financial Risk Alert             │
│ Vyapaar Sathi - Business Name       │
├─────────────────────────────────────┤
│ Hi John,                            │
│                                     │
│ Your business financial metrics...  │
│                                     │
│ ┌──────────────────────────────┐   │
│ │ 🚨 CRITICAL Risk Status      │   │
│ │ You may face immediate...    │   │
│ └──────────────────────────────┘   │
│                                     │
│ ┌─────┬─────┬─────┬─────┐         │
│ │Curr │Proj │Risk │Overdue│       │
│ │Cash │Cash │Score│Count │        │
│ │₹50K │-₹10K│ 85  │  3   │       │
│ └─────┴─────┴─────┴─────┘         │
│                                     │
│ Financial Breakdown:                │
│ • Overdue: ₹15,000                  │
│ • Upcoming: ₹8,000                  │
│ • Total: ₹23,000                    │
│                                     │
│ 💡 Suggested Action:                │
│ Reduce Expenses - Cut non-essential │
│ spending immediately...             │
│                                     │
│ [View Payment Radar] Button         │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuration Details

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_USER` | ✅ Yes | Gmail address (with 2FA) |
| `EMAIL_PASS` | ✅ Yes | 16-char Gmail App Password |
| `FRONTEND_URL` | ❌ No | Frontend URL for email link (default: http://localhost:5173) |
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | JWT signing secret |

### Alert Trigger Conditions

Email is sent when:
- `riskLevel === "HIGH"` OR `riskLevel === "CRITICAL"`
- **OR** `projectedCashAfterPayments < 0` (negative cash)
- **AND** `emailNotificationsEnabled === true`
- **AND** Last alert was > 24 hours ago (or never sent)

### Cooldown Logic

```javascript
const timeSinceLastAlert = now - lastAlertSent;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;  // 24 hours

if (timeSinceLastAlert < COOLDOWN_MS) {
    // Skip email, cooldown active
    console.log(`Can send next alert in ${Math.round((COOLDOWN_MS - timeSinceLastAlert) / (60 * 60 * 1000))} hours`);
    return;
}
```

---

## 📊 API Response Flow

### Original Response (Unchanged)
```javascript
res.json({
    success: true,
    timestamp: "...",
    financialStatus: { /* ... */ },
    analytics: { /* ... */ },
    overdueInvoices: { /* ... */ },
    upcomingPayments: { /* ... */ },
    summary: { /* ... */ }
});
```

### Email Check (Non-Blocking)
```javascript
// Called asynchronously, doesn't block response
checkAndSendFinancialAlert(user, responseData)
    .catch(err => console.error('Email error:', err));

// Response sent immediately after
res.json(responseData);
```

---

## 🔍 Logging & Monitoring

### Console Output Examples

**Email Sent Successfully**:
```
✅ Financial risk alert email sent: {
  to: 'user@example.com',
  messageId: '<...@gmail.com>',
  riskLevel: 'CRITICAL',
  timestamp: '2026-02-15T10:30:00.000Z'
}
```

**Cooldown Active**:
```
⏱️ Alert cooldown active for user@example.com. 
   Last alert: 12 hours ago. 
   Next available in 12 hours
```

**Notifications Disabled**:
```
⏭️ Email notifications disabled for user: user@example.com
```

**Email Failed**:
```
❌ Failed to send financial risk alert:
{
  error: 'Invalid login credentials',
  userEmail: 'user@example.com',
  timestamp: '2026-02-15T10:30:00.000Z'
}
```

---

## 🚨 Error Handling

### Graceful Degradation

Email errors **never** break the API response:

```javascript
try {
    checkAndSendFinancialAlert(user, responseData)
        .catch(err => console.error('Email error:', err));
} catch (error) {
    console.error('Unexpected error:', error);
    // Continue - don't throw
}

res.json(responseData);  // Always sent
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Email not sent` | Missing Gmail credentials | Add EMAIL_USER and EMAIL_PASS to .env |
| `Invalid login credentials` | Wrong app password | Generate new App Password from Google Account |
| `Account not enabled for less secure app access` | Gmail security | Use App Password method (not account password) |
| `Emails going to spam` | SPF/DKIM config | Check Gmail SMTP settings, may improve over time |
| `Cooldown not working` | lastAlertSent not updating | Ensure User document is being saved |
| `lastAlertSent is null` | First alert for user | This is normal, will be set after first alert |

---

## 🧪 Testing

### Test Case 1: Trigger HIGH Risk Alert

1. Create expenses totaling more than current cash
2. Set dueDate to tomorrow
3. Call GET /api/dashboard/payment-radar
4. Check email inbox (may take 10-30 seconds)
5. Verify email contains:
   - User name
   - Business name
   - ⚠️ HIGH RISK status
   - Financial metrics
   - Suggested action

### Test Case 2: Trigger CRITICAL Alert (Negative Cash)

1. Create expenses exceeding available cash
2. Call GET /api/dashboard/payment-radar
3. Check: `projectedCashAfterPayments < 0`
4. Verify email is sent with 🚨 CRITICAL warning

### Test Case 3: Verify Cooldown (24 Hour)

1. Send first alert (email sent)
2. lastAlertSent is updated to `now`
3. Call GET /api/dashboard/payment-radar again immediately
4. **Expected**: No email sent (cooldown active)
5. **Verify**: Console shows "cooldown active" message

### Test Case 4: Disable Notifications

1. Update user: `emailNotificationsEnabled = false`
2. Trigger HIGH/CRITICAL risk
3. **Expected**: No email sent
4. **Verify**: Console shows "notifications disabled" message

### Test via Postman

```
GET /api/dashboard/payment-radar
Headers:
  Authorization: Bearer YOUR_TOKEN

Example Response:
{
  "success": true,
  "financialStatus": {
    "riskLevel": "CRITICAL",
    ...
  }
}

Check email 30 seconds later
```

---

## 📱 Frontend Integration (Optional)

The email system is backend-only, but frontend can display the alert status:

```javascript
// In PaymentRadar.jsx
const { analytics } = radarData;

if (analytics.riskLevel === 'CRITICAL') {
    return (
        <div className="alert alert-critical">
            <p>⚠️ Email alert has been sent to {user.email}</p>
            <p>Check your email for details and suggested actions.</p>
        </div>
    );
}
```

---

## 🔐 Security Best Practices

✅ **Gmail App Password** (not account password)
✅ **Environment variables** (not hardcoded)
✅ **HTTPS only** (in production)
✅ **User consent** (emailNotificationsEnabled flag)
✅ **Non-blocking errors** (email errors don't crash API)
✅ **User identification** (via JWT authentication)
✅ **Spam prevention** (24-hour cooldown)
✅ **HTML escaping** (in email template)

---

## 📈 Future Enhancements

1. **Email Preferences**: Allow users to set custom alert thresholds
2. **Multiple Recipients**: Send to business partners/advisors
3. **SMS Alerts**: Critical alerts via text message
4. **Webhook Integration**: Notify external systems
5. **Email Unsubscribe**: Add unsubscribe link to emails
6. **Email History**: Track sent alerts in database
7. **Scheduled Reports**: Daily/weekly financial summary
8. **Templating**: User-customizable email templates

---

## 📞 Support & Troubleshooting

### Debug Mode

Enable detailed logging:

```javascript
// In emailService.js
console.log('DEBUG: Email config:', {
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS?.length
});
```

### Check Email Service

```bash
# Test Gmail credentials
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
t.verify((err, success) => {
  console.log(err || 'Gmail connection OK');
});
"
```

### Monitor Payment Radar Calls

```bash
# In production - check server logs
tail -f logs/payment-radar.log | grep -E "(EMAIL|Alert|Cooldown)"
```

---

## 🎓 Summary

The email notification system is:

✅ **Automatic** - Triggers on HIGH/CRITICAL risk
✅ **Non-intrusive** - 24-hour cooldown prevents spam
✅ **Professional** - HTML template with branding
✅ **Informative** - Complete financial metrics included
✅ **Actionable** - Suggested next steps provided
✅ **Reliable** - Error handling prevents API breakage
✅ **Secure** - App passwords, environment variables
✅ **Modular** - Easy to test and maintain

**Result**: Business owners get timely, professional financial alerts without being overwhelmed by notifications.
