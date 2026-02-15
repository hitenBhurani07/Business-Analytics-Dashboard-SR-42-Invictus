# Payment Radar Email Alerts - Backend Flow Summary

## Quick Reference: What Happens When User Gets Payment Radar

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GET /api/dashboard/payment-radar                     │
│                                                                         │
│  User sends request with JWT token                                     │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    dashboardController.getPaymentRadar()               │
│                                                                         │
│  1. Authenticate user (req.user._id)                                  │
│  2. Fetch User, Sales, Expense documents from MongoDB                 │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Calculate Financial Metrics                         │
│                                                                         │
│  • currentCash = startingCash + totalSales - totalExpenses             │
│  • totalSales = SUM of all sales                                       │
│  • totalExpenses = SUM of all expenses                                 │
│  • avgDailySales = calculateAverageDailySales(sales)                   │
│  • riskScore = calculateRiskScore(...)                                 │
│  • riskLevel = Determine from riskScore                                │
│  • aiExplanation = generateAIExplanation(...)                          │
│  • actionSuggestions = generateActionSuggestions(...)                  │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Build Response Object                               │
│                                                                         │
│  responseData = {                                                       │
│    success: true,                                                       │
│    financialStatus: { riskLevel, projectedCash, ... },                 │
│    analytics: { riskScore, aiExplanation, actionSuggestions, ... },    │
│    overdueInvoices: { count, totalAmount, invoices[] },                │
│    upcomingPayments: { count, totalAmount, invoices[] },               │
│    summary: { ... }                                                     │
│  }                                                                       │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │  checkAndSendFinancialAlert()   │
                    │  (Async, Non-blocking)          │
                    └────────┬────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Evaluate        │
                    │ Alert           │
                    │ Conditions      │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
     │ Check if    │  │ Check if    │  │ Check if     │
     │ email       │  │ riskLevel   │  │ projected    │
     │ enabled?    │  │ HIGH or     │  │ cash < 0?    │
     │             │  │ CRITICAL?   │  │              │
     │ No → Exit   │  │             │  │              │
     └─────────────┘  │ Yes → Next  │  │ Yes → Next   │
                      └─────────────┘  └──────────────┘
                             │                │
                             └────────┬───────┘
                                      │
                            If either condition met:
                                      │
                                      ▼
                        ┌─────────────────────────────┐
                        │ Check 24-Hour Cooldown      │
                        └──────────┬──────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
            │lastAlertSent │ │Calculate:   │ │Is time      │
            │exists?       │ │now -        │ │since last   │
            │              │ │lastAlertSent│ │alert < 24h? │
            │No → Continue │ │             │ │             │
            └──────────────┘ │             │ │ Yes → Exit  │
                             └─────────────┘ │(cooldown    │
                                             │ active)     │
                                             └─────────────┘
                                      │
                        If cooldown passed or no prior alert:
                                      │
                                      ▼
                    ┌──────────────────────────────┐
                    │ Prepare Email Data           │
                    │                              │
                    │ emailData = {                │
                    │   userEmail,                 │
                    │   userName,                  │
                    │   businessName,              │
                    │   riskLevel,                 │
                    │   projectedCash,             │
                    │   riskScore,                 │
                    │   overdueCount,              │
                    │   topSuggestion,             │
                    │   aiExplanation              │
                    │ }                            │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ sendFinancialRiskAlert()     │
                    │ (emailService.js)            │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ 1. Validate email config     │
                    │    (EMAIL_USER, EMAIL_PASS)  │
                    │                              │
                    │ 2. Create Nodemailer         │
                    │    transporter               │
                    │                              │
                    │ 3. Generate HTML template    │
                    │    (fancy formattin)         │
                    │                              │
                    │ 4. Send via Gmail SMTP       │
                    │                              │
                    │ 5. Return result             │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
            ✅ Email Sent              ❌ Email Failed
                    │                             │
                    ▼                             ▼
        Update user.lastAlertSent    Log error (non-blocking)
        Save user document           Continue
        Log success
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                    After email check completes (success or failure):
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Send API Response to Client  │
                    │                              │
                    │ res.json(responseData)       │
                    │                              │
                    │ (Email errors don't affect   │
                    │  API response!)              │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                        📱 Response reaches client
                        📧 Email in user's inbox (soon)
```

---

## Code Flow by File

### 1. **Frontend** → Request
```javascript
// In frontend/src/pages/PaymentRadar.jsx
const config = { headers: { Authorization: `Bearer ${token}` } };
const response = await axios.get(
    'http://localhost:5000/api/dashboard/payment-radar',
    config
);
```

### 2. **Backend** → Authentication + Setup
```javascript
// In backend/routes/dashboardRoutes.js
router.get('/payment-radar', protect, getPaymentRadar);
// ↓ protect middleware validates JWT

// In backend/controllers/dashboardController.js
const getPaymentRadar = async (req, res) => {
    const ownerId = req.user._id;  // From JWT token
    const user = await User.findById(ownerId);
    // ... proceed with data fetching
```

### 3. **Backend** → Data Fetching
```javascript
const sales = await Sales.find({ ownerId });
const expenses = await Expense.find({ ownerId });
// Aggregate financial data
// (All queries use ownerId filter = security)
```

### 4. **Backend** → Calculate Metrics (Helper Functions)
```javascript
// Helper 1: Average Daily Sales
const avgDailySales = calculateAverageDailySales(sales);
// Formula: totalSales / daysDifference

// Helper 2: Risk Score (0-100)
const riskScore = calculateRiskScore(
    currentCash, 
    projectedCash, 
    upcomingAmount, 
    avgDailySales, 
    overdueCount
);

// Helper 3: Risk Level Determination
if (riskScore >= 75) {
    riskLevel = 'CRITICAL';  // 🔴
} else if (riskScore >= 50) {
    riskLevel = 'HIGH';      // 🟠
} else if (riskScore >= 25) {
    riskLevel = 'MEDIUM';    // 🟡
} else {
    riskLevel = 'LOW';       // 🟢
}

// Helper 4: AI Explanation
const aiExplanation = generateAIExplanation(
    currentCash, 
    projectedCash, 
    overdueInvoices, 
    upcomingPayments, 
    avgDailySales
);

// Helper 5: Action Suggestions
const actionSuggestions = generateActionSuggestions(
    riskScore, 
    projectedCash, 
    overdueInvoices, 
    avgDailySales
);
```

### 5. **Backend** → EMAIL CHECK (New Process)
```javascript
// 👇 NEW: Email notification check

// Build response
const responseData = { ... };

// Check and send email (async, non-blocking)
checkAndSendFinancialAlert(user, responseData)
    .catch(err => console.error('Email error:', err));

// Continue immediately
res.json(responseData);
```

### 6. **In checkAndSendFinancialAlert Function**
```javascript
// Step 1: Check if user wants emails
if (!user.emailNotificationsEnabled) return;

// Step 2: Check alert conditions
const isHighRisk = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
const isNegativeCash = projectedCashAfterPayments < 0;
if (!isHighRisk && !isNegativeCash) return;

// Step 3: Check 24-hour cooldown
const now = new Date();
const lastAlertTime = user.lastAlertSent;
const timeSinceLastAlert = now - lastAlertTime;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

if (timeSinceLastAlert < COOLDOWN_MS) {
    console.log('Cooldown active, skipping email');
    return;
}

// Step 4: Prepare email payload
const emailData = {
    userEmail: user.email,
    userName: user.name,
    businessName: user.businessName,
    riskLevel: riskLevel,
    riskScore: riskScore,
    projectedCash: projectedCashAfterPayments,
    currentCash: currentCash,
    overdueCount: overdueInvoices.count,
    overdueAmount: overdueInvoices.totalAmount,
    upcomingAmount: upcomingPayments.totalAmount,
    topSuggestion: actionSuggestions[0].description,
    aiExplanation: aiExplanation
};

// Step 5: Send email
const emailResult = await sendFinancialRiskAlert(emailData);

// Step 6: Update user if successful
if (emailResult.success) {
    user.lastAlertSent = now;
    await user.save();
}
```

### 7. **In Nodemailer** (emailService.js)
```javascript
// Check credentials
if (!EMAIL_USER || !EMAIL_PASS) throw error;

// Create transporter
const transporter = getTransporter();

// Generate HTML
const htmlContent = generateFinancialAlertHTML(data);

// Prepare email
const mailOptions = {
    from: `"Vyapaar Sathi" <${EMAIL_USER}>`,
    to: data.userEmail,
    subject: '⚠️ Financial Risk Alert - Vyapaar Sathi',
    html: htmlContent,
    text: `...`
};

// Send
const info = await transporter.sendMail(mailOptions);

// Log and return
console.log('✅ Email sent:', info.messageId);
return { success: true, messageId: info.messageId };
```

### 8. **Email Arrives** 📧
User receives professional HTML email with:
- ✋ Risk status alert box
- 💰 Financial metrics (4 cards)
- 📊 Breakdown of expenses
- 💡 Suggested action
- 🔗 Button to Payment Radar
- 📝 Footer with company info

---

## Key Decision Points

### ⚙️ Decision: When to Send Email?

```
IF emailNotificationsEnabled = true
AND (riskLevel = "HIGH" OR "CRITICAL" OR projectedCash < 0)
AND (lastAlertSent = null OR (now - lastAlertSent) >= 24 hours)
THEN send email
```

### ⏰ Decision: Non-Blocking Design

```
Email check does NOT block API response:

Instead of:
  sendEmail() → wait → res.json()  ❌ SLOW

We do:
  sendEmail() ↗ (async)  →  res.json()  ✅ FAST
  (fire and forget)
```

### 🔐 Decision: Error Handling

```
Email errors NEVER break API:

try {
    checkAndSendFinancialAlert()
        .catch(err => log(err));  // Catch, don't throw
} catch (error) {
    log(error);  // Even if unexpected
}

res.json(responseData);  // Always sent
```

---

## Data Flow Summary Table

| Component | Input | Process | Output |
|-----------|-------|---------|--------|
| **Frontend** | User token | Request to API | JWT in header |
| **Auth Middleware** | JWT | Validate signature | req.user._id |
| **Data Fetching** | ownerId | MongoDB query | Sales[], Expenses[] |
| **Calculations** | Sales[], Expenses[] | Aggregate + compute | riskScore, riskLevel |
| **AI Logic** | metrics | Template-based | AI explanation |
| **Email Decision** | riskLevel, cash | Evaluate conditions | Send/Skip decision |
| **Cooldown Check** | lastAlertSent, now | Time difference | Allow/Block email |
| **Email Prep** | All metrics | Build payload | emailData object |
| **Nodemailer** | emailData | SMTP handshake | Email sent ✅ |
| **Database Update** | emailResult | If success | lastAlertSent updated |
| **API Response** | responseData | JSON format | Browser receives data |

---

## Environment Variables Used

```bash
# Required for email (MUST be set)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Optional
FRONTEND_URL=http://localhost:5173  # For email links

# Required for everything else
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

---

## Error Scenarios & Handling

| Scenario | What Breaks | How We Handle |
|----------|------------|---------------|
| Email credentials missing | Email sending | Log error, continue API |
| Gmail SMTP error | Email delivery | Log error, continue API |
| lastAlertSent corrupted | Cooldown check | Treat as first alert |
| User not found | Data fetch | Return 404 early |
| Sales/Expenses query fails | Calculation | Return 500 for that endpoint |
| Invalid User document | Database save | Log error, continue API |
| Response object too large | Serialization | JSON serializes properly |

---

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Database fetch (3 collections) | ~100-200ms | Indexed on ownerId |
| Risk calculations | ~5-10ms | Pure JS math |
| AI explanation generation | ~2-5ms | String building |
| Email sending | ~1-3 seconds | Non-blocking, user doesn't wait |
| API response time | ~150-300ms | Without email delay |
| **Total time for user** | ~150-300ms | Email sent in background |

---

## Testing Checklist

- [ ] Email sent when riskLevel = 'CRITICAL'
- [ ] Email sent when projectedCash < 0
- [ ] Email NOT sent when riskLevel = 'LOW'
- [ ] Cooldown prevents duplicate emails for 24 hours
- [ ] API response time not affected by email sending
- [ ] Email contains correct user name
- [ ] Email contains correct business name
- [ ] Email displays correct financial metrics
- [ ] Email includes suggested action
- [ ] Payment Radar link in email works
- [ ] Email looks good on mobile
- [ ] Disabling notifications stops emails
- [ ] Error logs don't crash API
- [ ] New users get email on first CRITICAL alert
- [ ] Existing users' cooldown respects previous alerts

---

## Summary

The email notification system works by:

1. **User calls API** → GET /api/dashboard/payment-radar
2. **Authenticate** → Verify JWT token
3. **Fetch data** → Get user, sales, expenses
4. **Calculate metrics** → Risk score, level, AI insight
5. **Build response** → Package all data for frontend
6. **Check email conditions** → HIGH/CRITICAL and cooldown
7. **Send email** → Non-blocking async call
8. **Update database** → Save lastAlertSent timestamp
9. **Return response** → Send to frontend immediately
10. **Email arrives** → User gets professional alert

**Key features**: 
- ✅ Backend-only (secure)
- ✅ Non-blocking (fast)
- ✅ Error-safe (API never breaks)
- ✅ Spam-proof (24-hour cooldown)
- ✅ User-controlled (enable/disable toggle)
