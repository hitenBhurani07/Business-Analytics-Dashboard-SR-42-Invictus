# SR-42-Invictus

A comprehensive business management dashboard application for inventory, sales, and expense tracking.

## Features

### Dashboard
- Real-time business status monitoring
- Sales and expense tracking
- Inventory management with stock alerts
- Cash flow projection
- Quick actions for logging sales and updating stock

### Analytics
- **Sales Revenue Trend** - Line chart showing sales revenue over time
- **Cash Flow Projection** - Track cash balance changes over time
- **Sales by Item** - Bar chart breakdown of revenue by product
- **Expenses by Category** - Pie chart visualization of spending distribution
- **Inventory Stock Levels** - Bar chart of current stock quantities
- **Inventory Details** - Comprehensive table with:
  - Item names and quantities
  - Cost and selling prices
  - Stock valuation
  - Daily usage rates
  - Days remaining (stock duration)
  - Status indicators (Critical/Warning/Healthy)

### Summary Metrics
- Current Cash Balance
- Total Sales
- Total Expenses
- Net Profit/Loss

## Technology Stack

**Frontend:**
- React 19.2.0
- React Router 7.13.0
- Tailwind CSS 4.1.18
- Recharts 2.10.3 (for professional data visualization)
- Vite 7.3.1

**Backend:**
- Node.js with Express 5.2.1
- MongoDB with Mongoose 9.2.1
- JWT Authentication
- Bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or connection string
- .env file configured

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Register a new account with business details and CSV files for inventory, sales, and expenses
2. Access the Dashboard for real-time monitoring and quick actions
3. Visit Analytics page for detailed data visualization and insights
4. All data is fetched from MongoDB database in real-time

## API Endpoints

### Dashboard Analytics
- `GET /api/dashboard/analytics/sales` - Sales data and trends
- `GET /api/dashboard/analytics/expenses` - Expense breakdown and trends
- `GET /api/dashboard/analytics/inventory` - Inventory details and valuation
- `GET /api/dashboard/analytics/cashflow` - Cash flow projection and summary