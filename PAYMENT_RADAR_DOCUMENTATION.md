# Payment Radar - Feature Documentation

## Overview
**Payment Radar** is an intelligent financial monitoring module for the Vyapaar Sathi business management system. It provides real-time visibility into pending expenses, identifies overdue invoices, tracks upcoming payments, and assesses financial risk levels.

---

## Features

### 1. **Overdue Invoice Detection**
- Scans all pending expenses in the database
- Identifies invoices where `dueDate < today` and `status = "Pending"`
- Calculates days overdue for each invoice
- Displays invoices sorted by due date

### 2. **Upcoming Payments Tracking**
- Identifies payments due within the next 3 days
- Shows days until payment is due
- Provides urgency indicators (Today, Tomorrow, In X days)
- Sorted by proximity to due date

### 3. **Financial Health Assessment**
- **Current Cash**: Calculated as `startingCash + totalSales - totalExpenses`
- **Upcoming Amount**: Sum of all overdue and upcoming payments
- **Projected Cash**: `currentCash - upcomingAmount`
- **Risk Level Assessment**:
  - **HIGH**: Projected cash < 0 (cannot afford all payments)
  - **MEDIUM**: Projected cash < 20% of current cash (low buffer)
  - **LOW**: Projected cash >= 20% of current cash (healthy)

### 4. **Summary Metrics**
- Total pending amount
- Number of overdue invoices
- Number of upcoming payments
- Can afford all payments (Yes/No)
- Next payment due date
- Critical action suggestions

---

## Backend Implementation

### Controller Function: `getPaymentRadar`

**File**: `backend/controllers/dashboardController.js`

```javascript
const getPaymentRadar = async (req, res) => {
    try {
        const ownerId = req.user._id;
        
        // Fetch user and transaction data
        const user = await User.findById(ownerId);
        const sales = await Sales.find({ ownerId });
        const expenses = await Expense.find({ ownerId });

        // Calculate current cash position
        const currentCash = user.startingCash + totalSales - totalExpenses;

        // Get today's date and 3 days later
        const today = new Date();
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);

        // Separate overdue and upcoming expenses
        // ... logic for filtering and categorizing
        
        // Calculate risk level
        // Calculate projected cash
        
        res.json({ /* response structure */ });
    } catch (error) {
        // Error handling
    }
};
```

### API Route

**File**: `backend/routes/dashboardRoutes.js`

```javascript
router.get('/payment-radar', protect, getPaymentRadar);
```

**Endpoint**: `GET /api/dashboard/payment-radar`

**Authentication**: Required (Bearer token in Authorization header)

---

## API Response Structure

### Example Response

```json
{
  "success": true,
  "timestamp": "2026-02-15T10:30:00.000Z",
  "financialStatus": {
    "currentCash": 45000,
    "upcomingAmount": 12000,
    "projectedCashAfterPayments": 33000,
    "riskLevel": "LOW",
    "riskColor": "green"
  },
  "overdueInvoices": {
    "count": 2,
    "totalAmount": 5000,
    "invoices": [
      {
        "id": "60d5ec49c1234567890abcde",
        "title": "Office Rent - January",
        "amount": 3000,
        "category": "Rent",
        "dueDate": "2026-02-10T00:00:00.000Z",
        "daysOverdue": 5,
        "status": "Overdue"
      },
      {
        "id": "60d5ec49c1234567890abcdf",
        "title": "Internet Bill",
        "amount": 2000,
        "category": "Utilities",
        "dueDate": "2026-02-12T00:00:00.000Z",
        "daysOverdue": 3,
        "status": "Overdue"
      }
    ]
  },
  "upcomingPayments": {
    "count": 3,
    "totalAmount": 7000,
    "invoices": [
      {
        "id": "60d5ec49c1234567890abce0",
        "title": "Supplier Payment",
        "amount": 3000,
        "category": "Purchases",
        "dueDate": "2026-02-15T00:00:00.000Z",
        "daysUntilDue": 0,
        "urgency": "today",
        "status": "Upcoming"
      },
      {
        "id": "60d5ec49c1234567890abce1",
        "title": "Staff Salary",
        "amount": 2500,
        "category": "Payroll",
        "dueDate": "2026-02-16T00:00:00.000Z",
        "daysUntilDue": 1,
        "urgency": "tomorrow",
        "status": "Upcoming"
      },
      {
        "id": "60d5ec49c1234567890abce2",
        "title": "Tax Payment",
        "amount": 1500,
        "category": "Taxes",
        "dueDate": "2026-02-18T00:00:00.000Z",
        "daysUntilDue": 3,
        "urgency": "in 3 days",
        "status": "Upcoming"
      }
    ]
  },
  "summary": {
    "totalPendingAmount": 12000,
    "criticalAction": "No immediate action needed",
    "nextPaymentDue": "2026-02-15T00:00:00.000Z",
    "canAffordAllPayments": true
  }
}
```

---

## Frontend Integration

### React Component: `PaymentRadar.jsx`

**File**: `frontend/src/pages/PaymentRadar.jsx`

#### Key Features:
1. **Risk Dashboard**: Visual risk assessment with color coding
2. **Key Metrics Cards**: Current cash, upcoming payments, projected cash, affordability
3. **Overdue Invoices Table**: Lists all overdue invoices with days overdue
4. **Upcoming Payments Table**: Shows payments due in next 3 days with urgency indicators
5. **Summary Section**: Overview of financial status and recommendations

#### Component Structure:

```jsx
const PaymentRadar = () => {
    const [radarData, setRadarData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPaymentRadar = useCallback(async () => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get(
            'http://localhost:5000/api/dashboard/payment-radar',
            config
        );
        setRadarData(response.data);
    }, []);

    // UI components for displaying data
    return (
        <div>
            {/* Risk Status Card */}
            {/* Key Metrics */}
            {/* Overdue Invoices Table */}
            {/* Upcoming Payments Table */}
            {/* Summary Section */}
        </div>
    );
};
```

### Using Payment Radar Data in Dashboard

```jsx
// In Dashboard or any page where you need payment info
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';

const DashboardComponent = () => {
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/dashboard/payment-radar',
                    config
                );
                
                const { financialStatus, overdueInvoices } = response.data;
                
                // Use data to show alerts
                if (overdueInvoices.count > 0) {
                    console.warn(`⚠️ ${overdueInvoices.count} overdue invoices!`);
                }
                
                if (financialStatus.riskLevel === 'HIGH') {
                    console.error('🚨 High financial risk detected!');
                }
                
                setPaymentStatus(financialStatus);
            } catch (error) {
                console.error('Failed to fetch payment status', error);
            }
        };

        fetchPaymentStatus();
    }, []);

    return (
        <div>
            {paymentStatus && (
                <div className={`alert alert-${paymentStatus.riskLevel.toLowerCase()}`}>
                    Risk Level: {paymentStatus.riskLevel}
                </div>
            )}
        </div>
    );
};
```

---

## Database Schema Updates

### Expense Model

The Expense model has been updated to include:

```javascript
{
    ownerId: ObjectId,
    title: String,
    amount: Number,
    date: Date,
    dueDate: Date,        // NEW: When payment is due
    category: String,
    status: String        // NEW: 'Pending', 'Paid', 'Overdue'
}
```

**Migration Note**: Existing expenses will have:
- `dueDate` defaults to 7 days from today
- `status` defaults to 'Pending'

---

## Usage Instructions

### For End Users

1. **Navigate to Payment Radar**
   - Go to Dashboard → Click "Payment Radar" link

2. **Check Financial Status**
   - View risk level and critical actions
   - Review current cash position
   - See projected cash after payments

3. **Address Overdue Invoices**
   - Sort by days overdue
   - Take immediate action for critical overages

4. **Plan for Upcoming Payments**
   - Review payments due in next 3 days
   - Ensure sufficient funds
   - Schedule payments accordingly

### For Developers

#### Testing Payment Radar

```javascript
// Test via Postman or curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/payment-radar
```

#### Adding Payment Radar to Other Components

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

// Fetch payment radar data
const token = localStorage.getItem('token');
const { data } = await axios.get(
    'http://localhost:5000/api/dashboard/payment-radar',
    { headers: { Authorization: `Bearer ${token}` } }
);

// Access specific data
const { overdueCount } = data.overdueInvoices;
const { riskLevel } = data.financialStatus;
```

---

## Risk Level Logic

```
IF projectedCashAfterPayments < 0:
    riskLevel = "HIGH" (RED) - Cannot afford all payments
    
ELSE IF projectedCashAfterPayments < (currentCash * 0.20):
    riskLevel = "MEDIUM" (YELLOW) - Low cash buffer
    
ELSE:
    riskLevel = "LOW" (GREEN) - Healthy financial position
```

---

## Performance Considerations

1. **Database Queries**: Uses indexed queries on `ownerId` for fast lookups
2. **Date Calculations**: All dates are calculated server-side (no timezone issues)
3. **Caching**: Can be cached for 1-5 minutes if real-time updates not critical
4. **Pagination**: For large datasets, add pagination to invoice lists

---

## Future Enhancements

1. **Payment Automation**: Auto-pay from cash when due date arrives
2. **Email Notifications**: Alert before payment due dates
3. **Payment History**: Track paid invoices
4. **Recurring Expenses**: Setup recurring payment patterns
5. **Payment Methods**: Integrate with payment gateways
6. **Analytics**: Payment trends and patterns
7. **Mobile Alerts**: Push notifications for overdue payments
8. **Expense Forecasting**: Predict upcoming cash needs

---

## Troubleshooting

### Issue: Payment Radar shows 0 payments
**Solution**: Ensure expenses have valid `dueDate` and `status: "Pending"` in database

### Issue: Risk level always LOW
**Solution**: Check that `startingCash`, `totalSales`, and `totalExpenses` are correctly calculated

### Issue: Dates showing incorrectly
**Solution**: Ensure MongoDB stores dates in UTC; frontend converts for display

---

## API Error Responses

```json
// 401 Unauthorized
{
  "message": "Not authorized, no token"
}

// 404 User not found
{
  "message": "User not found"
}

// 500 Server error
{
  "success": false,
  "message": "Server error retrieving payment radar data",
  "error": "Error details"
}
```

---

## Summary

Payment Radar provides comprehensive financial visibility for business owners, helping them:
- ✅ Track pending payments
- ✅ Identify overdue invoices
- ✅ Assess financial health
- ✅ Make informed decisions
- ✅ Prevent cash flow crises

The module is production-ready, scalable, and handles edge cases safely.
