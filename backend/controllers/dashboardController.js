const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { sendFinancialRiskAlert } = require('../utils/emailService');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const user = await User.findById(ownerId);

        // Calculate totals
        const sales = await Sales.find({ ownerId });
        const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);

        const expenses = await Expense.find({ ownerId });
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

        const currentCash = user.startingCash + totalSales - totalExpenses;

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysSales = sales
            .filter(s => new Date(s.date) >= today)
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        const todaysExpenses = expenses
            .filter(e => new Date(e.date) >= today)
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Low stock count (Burn rate < 5 days)
        const inventory = await Inventory.find({ ownerId });
        const lowStockCount = inventory.filter(item => {
            if (item.dailyUsage === 0) return false;
            const daysRemaining = item.quantity / item.dailyUsage;
            return daysRemaining < 5;
        }).length;

        res.json({
            currentCash,
            todaysSales,
            todaysExpenses,
            lowStockCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get dashboard alerts
// @route   GET /api/dashboard/alerts
// @access  Private
const getAlerts = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const alerts = [];

        const inventory = await Inventory.find({ ownerId });
        inventory.forEach(item => {
            if (item.dailyUsage > 0) {
                const daysRemaining = item.quantity / item.dailyUsage;
                if (daysRemaining < 2) {
                    alerts.push({
                        type: 'inventory',
                        message: `Critical: ${item.itemName} has less than 3 days of stock remaining!`,
                        level: 'red',
                        action: 'Order Inventory'
                    });
                } else if (daysRemaining < 5) {
                    alerts.push({
                        type: 'inventory',
                        message: `Warning: ${item.itemName} is running low (under 5 days).`,
                        level: 'yellow',
                        action: 'Order Inventory'
                    });
                }
            }
        });

        const user = await User.findById(ownerId);
        const sales = await Sales.find({ ownerId });
        const expenses = await Expense.find({ ownerId });

        const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const currentCash = user.startingCash + totalSales - totalExpenses;

        const msPerDay = 1000 * 60 * 60 * 24;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoDaysLaterEnd = new Date(today.getTime() + (2 * msPerDay));
        twoDaysLaterEnd.setHours(23, 59, 59, 999);

        const expectedSales = sales
            .filter(s => {
                const d = new Date(s.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        const upcomingBills = expenses
            .filter(e => {
                const d = new Date(e.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const projectedCash = currentCash + expectedSales - upcomingBills;

        if (projectedCash < 0) {
            alerts.push({
                type: 'finance',
                message: 'Projected cash will be negative within 48 hours.',
                level: 'red',
                action: 'Reduce burn / defer expenses'
            });
        } else if (projectedCash < 1000) {
            alerts.push({
                type: 'finance',
                message: 'Projected cash is low but positive.',
                level: 'yellow',
                action: 'Increase sales / review expenses'
            });
        }

        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get inventory risk list
// @route   GET /api/dashboard/inventory-risk
// @access  Private
const getInventoryRisk = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const inventory = await Inventory.find({ ownerId });

        const riskItems = inventory
            .map(item => {
                const daysRemaining = item.dailyUsage > 0 ? (item.quantity / item.dailyUsage).toFixed(1) : '999';
                return {
                    ...item.toObject(),
                    daysRemaining: Number(daysRemaining)
                };
            })
            .filter(item => item.daysRemaining < 5)
            .sort((a, b) => a.daysRemaining - b.daysRemaining);

        res.json(riskItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get cash projection
// @route   GET /api/dashboard/cash-projection
// @access  Private
const getCashProjection = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const user = await User.findById(ownerId);
        const sales = await Sales.find({ ownerId });
        const expenses = await Expense.find({ ownerId });

        const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const currentCash = user.startingCash + totalSales - totalExpenses;

        const msPerDay = 1000 * 60 * 60 * 24;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoDaysLaterEnd = new Date(today.getTime() + (2 * msPerDay));
        twoDaysLaterEnd.setHours(23, 59, 59, 999);

        const expectedSales = sales
            .filter(s => {
                const d = new Date(s.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        const upcomingBills = expenses
            .filter(e => {
                const d = new Date(e.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const projectedCash = currentCash + expectedSales - upcomingBills;

        // Calculate average daily sales and expenses
        let avgDailySales = 0;
        let avgDailyExpenses = 0;

        if (sales.length > 0 || expenses.length > 0) {
            // Get the earliest transaction date
            const allTransactions = [
                ...sales.map(s => new Date(s.date)),
                ...expenses.map(e => new Date(e.date))
            ];
            
            if (allTransactions.length > 0) {
                const earliestDate = new Date(Math.min(...allTransactions.map(d => d.getTime())));
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                
                // Calculate days between earliest transaction and today
                const timeDiff = todayDate.getTime() - earliestDate.getTime();
                const daysDiff = Math.max(1, Math.ceil(timeDiff / msPerDay)); // At least 1 day
                
                avgDailySales = Math.round((totalSales / daysDiff) * 100) / 100;
                avgDailyExpenses = Math.round((totalExpenses / daysDiff) * 100) / 100;
            }
        }

        res.json({
            currentCash,
            projectedCash,
            expectedSales,
            upcomingBills,
            status: projectedCash < 0 ? 'red' : (projectedCash < 1000 ? 'yellow' : 'green'),
            projectionPeriod: '2 days',
            avgDailySales,
            avgDailyExpenses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const logSale = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { itemName, quantity, totalAmount } = req.body;
        const item = await Inventory.findOne({ ownerId, itemName });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        const qty = Number(quantity || 0);
        if (qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
        if (item.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });
        const amount = totalAmount != null ? Number(totalAmount) : Number(item.sellingPrice) * qty;
        const sale = await Sales.create({
            ownerId,
            itemName,
            quantity: qty,
            totalAmount: amount,
            date: new Date()
        });
        item.quantity = item.quantity - qty;
        await item.save();
        res.json({ sale, inventory: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStock = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { itemName, addQuantity } = req.body;
        const item = await Inventory.findOne({ ownerId, itemName });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        const addQty = Number(addQuantity || 0);
        if (addQty === 0) return res.status(400).json({ message: 'Invalid quantity' });
        item.quantity = item.quantity + addQty;
        await item.save();
        res.json({ inventory: item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getInventory = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const items = await Inventory.find({ ownerId }).sort({ itemName: 1 });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getStatus = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const inventory = await Inventory.find({ ownerId });
        const user = await User.findById(ownerId);
        const sales = await Sales.find({ ownerId });
        const expenses = await Expense.find({ ownerId });
        const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const currentCash = user.startingCash + totalSales - totalExpenses;
        const msPerDay = 1000 * 60 * 60 * 24;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoDaysLaterEnd = new Date(today.getTime() + (2 * msPerDay));
        twoDaysLaterEnd.setHours(23, 59, 59, 999);
        const expectedSales = sales
            .filter(s => {
                const d = new Date(s.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.totalAmount, 0);
        const upcomingBills = expenses
            .filter(e => {
                const d = new Date(e.date);
                return d >= today && d <= twoDaysLaterEnd;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
        const projectedCash = currentCash + expectedSales - upcomingBills;
        let hasRed = false;
        let hasYellow = false;
        inventory.forEach(item => {
            if (item.dailyUsage > 0) {
                const daysRemaining = item.quantity / item.dailyUsage;
                if (daysRemaining < 2) hasRed = true;
                else if (daysRemaining < 5) hasYellow = true;
            }
        });
        if (projectedCash < 0) hasRed = true;
        else if (projectedCash < 1000) hasYellow = true;
        const status = hasRed ? 'red' : (hasYellow ? 'yellow' : 'green');
        res.json
        ({ status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get sales analytics
// @route   GET /api/dashboard/analytics/sales
// @access  Private
const getSalesAnalytics = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const sales = await Sales.find({ ownerId }).sort({ date: 1 });
        
        // Group by date
        const salesByDate = {};
        const salesByItem = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += sale.totalAmount;
            
            if (!salesByItem[sale.itemName]) {
                salesByItem[sale.itemName] = { quantity: 0, amount: 0 };
            }
            salesByItem[sale.itemName].quantity += sale.quantity;
            salesByItem[sale.itemName].amount += sale.totalAmount;
        });
        
        const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
            date,
            amount: Math.round(amount * 100) / 100
        }));
        
        const itemData = Object.entries(salesByItem).map(([itemName, data]) => ({
            name: itemName,
            quantity: data.quantity,
            amount: Math.round(data.amount * 100) / 100
        }));
        
        res.json({
            chartData,
            itemData,
            totalSales: Math.round(sales.reduce((acc, curr) => acc + curr.totalAmount, 0) * 100) / 100,
            totalQuantity: sales.reduce((acc, curr) => acc + curr.quantity, 0)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get expense analytics
// @route   GET /api/dashboard/analytics/expenses
// @access  Private
const getExpenseAnalytics = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const expenses = await Expense.find({ ownerId }).sort({ date: 1 });
        
        // Group by category and date
        const expensesByCategory = {};
        const expensesByDate = {};
        
        expenses.forEach(expense => {
            if (!expensesByCategory[expense.category]) {
                expensesByCategory[expense.category] = 0;
            }
            expensesByCategory[expense.category] += expense.amount;
            
            const date = new Date(expense.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (!expensesByDate[date]) {
                expensesByDate[date] = 0;
            }
            expensesByDate[date] += expense.amount;
        });
        
        const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
            name: category,
            value: Math.round(amount * 100) / 100
        }));
        
        const chartData = Object.entries(expensesByDate).map(([date, amount]) => ({
            date,
            amount: Math.round(amount * 100) / 100
        }));
        
        res.json({
            categoryData,
            chartData,
            totalExpenses: Math.round(expenses.reduce((acc, curr) => acc + curr.amount, 0) * 100) / 100,
            expenseCount: expenses.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get inventory analytics
// @route   GET /api/dashboard/analytics/inventory
// @access  Private
const getInventoryAnalytics = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const inventory = await Inventory.find({ ownerId });
        
        const inventoryData = inventory.map(item => ({
            name: item.itemName,
            quantity: item.quantity,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            value: Math.round(item.quantity * item.costPrice * 100) / 100,
            dailyUsage: item.dailyUsage,
            daysRemaining: item.dailyUsage > 0 ? Math.round((item.quantity / item.dailyUsage) * 10) / 10 : 999
        }));
        
        const totalInventoryValue = Math.round(inventoryData.reduce((acc, curr) => acc + curr.value, 0) * 100) / 100;
        const totalQuantity = inventoryData.reduce((acc, curr) => acc + curr.quantity, 0);
        const lowStockItems = inventoryData.filter(item => item.daysRemaining < 5);
        
        res.json({
            inventoryData,
            totalInventoryValue,
            totalQuantity,
            lowStockCount: lowStockItems.length,
            lowStockItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get cash flow analytics
// @route   GET /api/dashboard/analytics/cashflow
// @access  Private

const getCashFlowAnalytics = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const user = await User.findById(ownerId);
        const sales = await Sales.find({ ownerId }).sort({ date: 1 });
        const expenses = await Expense.find({ ownerId }).sort({ date: 1 });
        
        let runningCash = user.startingCash;
        const cashFlowData = [];
        
        // Create timeline of all transactions
        const allTransactions = [
            ...sales.map(s => ({ 
                date: s.date, 
                type: 'sale', 
                amount: s.totalAmount 
            })),
            ...expenses.map(e => ({ 
                date: e.date, 
                type: 'expense', 
                amount: -e.amount 
            }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const dateMap = {};
        
        allTransactions.forEach(transaction => {
            const date = new Date(transaction.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (!dateMap[date]) {
                dateMap[date] = runningCash;
            }
            
            runningCash += transaction.amount;
            dateMap[date] = runningCash;
        });
        
        const chartData = Object.entries(dateMap).map(([date, cash]) => ({
            date,
            cash: Math.round(cash * 100) / 100
        }));
        
        // If no transactions, show starting cash
        if (chartData.length === 0) {
            chartData.push({
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                cash: user.startingCash
            });
        }
        
        const totalSales = Math.round(sales.reduce((acc, curr) => acc + curr.totalAmount, 0) * 100) / 100;
        const totalExpenses = Math.round(expenses.reduce((acc, curr) => acc + curr.amount, 0) * 100) / 100;
        const currentCash = Math.round(runningCash * 100) / 100;
        
        res.json({
            chartData,
            summary: {
                startingCash: user.startingCash,
                totalSales,
                totalExpenses,
                currentCash,
                netProfit: Math.round((totalSales - totalExpenses) * 100) / 100
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Payment Radar - Financial monitoring for pending expenses
// @route   GET /api/dashboard/payment-radar
// @access  Private
// Helper function to calculate average daily sales
const calculateAverageDailySales = (sales) => {
    if (sales.length === 0) return 0;

    const sortedSales = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDate = new Date(sortedSales[0].date);
    const lastDate = new Date(sortedSales[sortedSales.length - 1].date);
    
    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24) + 1);
    const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    
    return Math.round((totalSales / daysDiff) * 100) / 100;
};

// Helper function to calculate risk score (0-100)
const calculateRiskScore = (currentCash, projectedCash, upcomingAmount, avgDailySales, overdueCount) => {
    let score = 0; // Base score
    
    // Factor 1: Negative projected cash (Critical)
    if (projectedCash < 0) {
        score += 40; // Critical
    } else if (projectedCash < currentCash * 0.1) {
        score += 30;
    } else if (projectedCash < currentCash * 0.2) {
        score += 20;
    } else if (projectedCash < currentCash * 0.5) {
        score += 10;
    }

    
    // Factor 2: Upcoming amount vs average daily sales
    if (avgDailySales > 0) {
        const daysOfSalesNeeded = upcomingAmount / avgDailySales;

        if (daysOfSalesNeeded > 7) {
            score += 25;
        } else if (daysOfSalesNeeded > 5) {
            score += 15;
        } else if (daysOfSalesNeeded > 3) {
            score += 8;
        }
    }
    
    // Factor 3: Overdue invoices
      score += Math.min(overdueCount * 5, 20);

    // 4️⃣ Liquidity Cushion Risk (15% weight)
    if (currentCash < upcomingAmount) {
        score += 15;
    }

    return Math.min(100, score);
};

// Helper function to generate AI explanation
const generateAIExplanation = (currentCash, projectedCash, overdueInvoices, upcomingPayments, avgDailySales) => {
    const overdueCount = overdueInvoices.length;
    const upcomingCount = upcomingPayments.length;
    const totalUpcoming = overdueInvoices.concat(upcomingPayments);
    
    if (totalUpcoming.length === 0) {
        return "Your business is financially healthy with no pending payments. Maintain this positive cash flow trajectory.";
    }
    
    const topExpense = totalUpcoming.reduce((max, curr) => curr.amount > max.amount ? curr : max);
    const daysToShortage = avgDailySales > 0 ? Math.ceil(projectedCash / avgDailySales) : 0;
    
    let message = "";
    
    if (projectedCash < 0) {
        message = `Critical: You may face immediate cash shortage! After ${upcomingCount} upcoming payment(s), your cash will be negative. `;
    } else if (projectedCash < avgDailySales) {
        message = `Warning: You have only ${daysToShortage} day(s) of sales needed to cover upcoming payments. `;
    } else if (projectedCash < currentCash * 0.2) {
        message = `Caution: Your cash buffer is low at only 20% of current reserves. `;
    } else {
        message = `✓ Stable: Your projected cash is healthy. `;
    }
    
    if (overdueCount > 0) {
        message += `You have ${overdueCount} overdue invoice(s) totaling ₹${overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}. `;
    }
    
    if (upcomingCount > 0) {
        const nextPayment = upcomingPayments[0];
        const daysUntil = nextPayment.daysUntilDue;
        message += `Your largest upcoming expense is ${topExpense.title} (₹${topExpense.amount.toLocaleString()}) - `;
        
        if (daysUntil === 0) {
            message += `due today.`;
        } else if (daysUntil === 1) {
            message += `due tomorrow.`;
        } else {
            message += `due in ${daysUntil} days.`;
        }
    }
    
    return message;
};

// Helper function to generate action suggestions
const generateActionSuggestions = (riskScore, projectedCash, overdueInvoices, avgDailySales) => {
    const suggestions = [];
    
    if (riskScore >= 75) {
        suggestions.push({
            priority: 'critical',
            action: 'Reduce Expenses',
            description: 'Cut non-essential spending immediately to preserve cash',
        });
        suggestions.push({
            priority: 'critical',
            action: 'Increase Sales',
            description: 'Focus on revenue generation - call customers, offer discounts',
        });
    }
    
    if (projectedCash < avgDailySales && avgDailySales > 0) {
        suggestions.push({
            priority: 'high',
            action: 'Negotiate Payment Terms',
            description: 'Request 15-30 day payment extensions from creditors',
        });
    }
    
    if (overdueInvoices.length > 0) {
        suggestions.push({
            priority: 'high',
            action: 'Pay Overdue Invoices',
            description: `Settle ${overdueInvoices.length} overdue invoice(s) to avoid penalties`,
        });
    }
    
    if (projectedCash > 0 && projectedCash < avgDailySales * 2) {
        suggestions.push({
            priority: 'medium',
            action: 'Build Cash Reserve',
            description: 'Aim to maintain 2-3 weeks of operating expenses in reserve',
        });
    }
    
    if (riskScore >= 50) {
        suggestions.push({
            priority: 'medium',
            action: 'Review Inventory',
            description: 'Optimize stock levels to free up tied-up capital',
        });
    }
    
    if (riskScore < 40) {
        suggestions.push({
            priority: 'low',
            action: 'Invest in Growth',
            description: 'Consider reinvesting profits to expand operations',
        });
    }
    
    return suggestions;
};

// Helper function to check and send financial risk alert email
const checkAndSendFinancialAlert = async (user, paymentRadarData) => {
    try {
        console.log(`\n🔍 [Email Alert Check] Starting for user: ${user.email}`);
        console.log(`   User._id: ${user._id}`);
        console.log(`   emailNotificationsEnabled: ${user.emailNotificationsEnabled}`);
        
        // Check if user has notifications enabled
        if (!user.emailNotificationsEnabled) {
            console.log(`⏭️ Email notifications disabled for user: ${user.email}`);
            return;
        }

        const { riskScore, riskLevel, aiExplanation, actionSuggestions } = paymentRadarData.analytics;
        const { currentCash, projectedCashAfterPayments, upcomingAmount } = paymentRadarData.financialStatus;
        const { overdueInvoices, upcomingPayments } = paymentRadarData;

        console.log(`   Risk Level: ${riskLevel}, Risk Score: ${riskScore}`);
        console.log(`   Projected Cash: ${projectedCashAfterPayments}`);
        console.log(`   Overdue Count: ${overdueInvoices.count}`);

        // Condition 1: Risk level is HIGH or CRITICAL
        const isHighRisk = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
        
        // Condition 2: Projected cash is negative
        const isNegativeCash = projectedCashAfterPayments < 0;

        console.log(`   isHighRisk (HIGH|CRITICAL): ${isHighRisk}`);
        console.log(`   isNegativeCash (< 0): ${isNegativeCash}`);

        // If neither condition is met, no alert needed
        if (!isHighRisk && !isNegativeCash) {
            console.log(`✅ Financial status healthy - No alert needed`);
            return;
        }

        console.log(`   ✓ Alert conditions MET - Will proceed to check cooldown`);

        // Check 24-hour cooldown
        const now = new Date();
        const lastAlertTime = user.lastAlertSent ? new Date(user.lastAlertSent) : null;
        const COOLDOWN_HOURS = 24;
        const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

        console.log(`   lastAlertSent: ${lastAlertTime ? lastAlertTime.toISOString() : 'null'}`);

        if (lastAlertTime) {
            const timeSinceLastAlert = now - lastAlertTime;
            if (timeSinceLastAlert < COOLDOWN_MS) {
                const hoursSinceLastAlert = Math.floor(timeSinceLastAlert / (60 * 60 * 1000));
                console.log(`⏱️ Cooldown active: ${hoursSinceLastAlert}/${COOLDOWN_HOURS} hours elapsed`);
                return;
            }
        }

        console.log(`   ✓ Cooldown check passed - Preparing email...`);

        // Prepare email data
        const topSuggestion = actionSuggestions.length > 0 
            ? actionSuggestions[0].description 
            : 'Monitor your financial metrics closely and take immediate corrective action.';

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
            topSuggestion: topSuggestion,
            aiExplanation: aiExplanation
        };

        console.log(`   Sending alert to: ${emailData.userEmail}`);
        console.log(`   Risk Level: ${emailData.riskLevel}, Risk Score: ${emailData.riskScore}`);

        // Send email
        const emailResult = await sendFinancialRiskAlert(emailData);

        console.log(`   Email send result:`, emailResult);

        // Update lastAlertSent timestamp if email was sent successfully
        if (emailResult.success) {
            user.lastAlertSent = now;
            await user.save();
            console.log(`✅ EMAIL SENT! lastAlertSent updated for ${user.email}`);
            console.log(`   Next eligible time: ${new Date(now.getTime() + COOLDOWN_MS).toISOString()}\n`);
        } else {
            console.error(`❌ Failed to send alert email for ${user.email}`);
            console.error(`   Error: ${emailResult.error}\n`);
        }

    } catch (error) {
        console.error(`❌ Error in checkAndSendFinancialAlert:`, error);
        // Don't throw - we don't want email errors to break the API response
    }
};

const getPaymentRadar = async (req, res) => {
    try {
        const ownerId = req.user._id;
        
        // Fetch user and transaction data
        const user = await User.findById(ownerId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sales = await Sales.find({ ownerId });
        const expenses = await Expense.find({ ownerId });

        // Calculate current cash position
        const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const currentCash = Math.round((user.startingCash + totalSales - totalExpenses) * 100) / 100;

        // Calculate average daily sales
        const avgDailySales = calculateAverageDailySales(sales);

        // Get today's date at midnight for accurate comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get date 3 days from now
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        threeDaysLater.setHours(23, 59, 59, 999);

        // Separate overdue and upcoming expenses
        const overdueInvoices = [];
        const upcomingPayments = [];
        let upcomingAmount = 0;

        // Process all pending expenses
        expenses.forEach(expense => {
            // Skip if status is not Pending
            if (expense.status !== 'Pending') return;

            const dueDate = new Date(expense.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            // Check if overdue (dueDate < today)
            if (dueDate < today) {
                overdueInvoices.push({
                    id: expense._id,
                    title: expense.title,
                    amount: Math.round(expense.amount * 100) / 100,
                    category: expense.category,
                    dueDate: expense.dueDate,
                    daysOverdue: Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)),
                    status: 'Overdue'
                });
                upcomingAmount += expense.amount;
            }
            // Check if upcoming (today <= dueDate <= threeDaysLater)
            else if (dueDate >= today && dueDate <= threeDaysLater) {
                const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                upcomingPayments.push({
                    id: expense._id,
                    title: expense.title,
                    amount: Math.round(expense.amount * 100) / 100,
                    category: expense.category,
                    dueDate: expense.dueDate,
                    daysUntilDue,
                    urgency: daysUntilDue === 0 ? 'today' : (daysUntilDue === 1 ? 'tomorrow' : `in ${daysUntilDue} days`),
                    status: 'Upcoming'
                });
                upcomingAmount += expense.amount;
            }
        });

        // Calculate projected cash after upcoming payments
        const projectedCashAfterPayments = Math.round((currentCash - upcomingAmount) * 100) / 100;

        // Calculate enhanced metrics FIRST (before determining risk level)
        const riskScore = calculateRiskScore(currentCash, projectedCashAfterPayments, upcomingAmount, avgDailySales, overdueInvoices.length);
        const aiExplanation = generateAIExplanation(currentCash, projectedCashAfterPayments, overdueInvoices, upcomingPayments, avgDailySales);
        const actionSuggestions = generateActionSuggestions(riskScore, projectedCashAfterPayments, overdueInvoices, avgDailySales);

        // Determine risk level based on riskScore (0-100)
        let riskLevel = 'LOW';
        if (riskScore >= 75) {
            riskLevel = 'CRITICAL';  // 🔴 Score 75+
        } else if (riskScore >= 50) {
            riskLevel = 'HIGH';      // 🟠 Score 50-74
        } else if (riskScore >= 25) {
            riskLevel = 'MEDIUM';    // 🟡 Score 25-49
        }
        // else LOW (Score < 25)

        console.log(`💰 Payment Radar Calculation for ${user.email}:`, {
            currentCash,
            projectedCashAfterPayments,
            avgDailySales: Math.round(avgDailySales),
            riskScore,
            riskLevel,
            overdueCount: overdueInvoices.length,
            upcomingCount: upcomingPayments.length
        });

        // Sort payments by due date
        overdueInvoices.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Build response object
        const responseData = {
            success: true,
            timestamp: new Date(),
            financialStatus: {
                currentCash: Math.round(currentCash * 100) / 100,
                upcomingAmount: Math.round(upcomingAmount * 100) / 100,
                projectedCashAfterPayments,
                riskLevel,
                riskColor: riskLevel === 'HIGH' ? 'red' : (riskLevel === 'MEDIUM' ? 'yellow' : 'green'),
                healthStatus: riskLevel === 'HIGH' ? 'Critical' : (riskLevel === 'MEDIUM' ? 'Caution' : 'Healthy')
            },
            analytics: {
                averageDailySales: Math.round(avgDailySales * 100) / 100,
                riskScore,
                aiExplanation,
                actionSuggestions
            },
            overdueInvoices: {
                count: overdueInvoices.length,
                totalAmount: Math.round(
                    overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0) * 100
                ) / 100,
                invoices: overdueInvoices
            },
            upcomingPayments: {
                count: upcomingPayments.length,
                totalAmount: Math.round(
                    upcomingPayments.reduce((sum, inv) => sum + inv.amount, 0) * 100
                ) / 100,
                invoices: upcomingPayments
            },
            summary: {
                totalPendingAmount: Math.round(
                    [...overdueInvoices, ...upcomingPayments].reduce((sum, inv) => sum + inv.amount, 0) * 100
                ) / 100,
                criticalAction: riskLevel === 'HIGH' ? 'Immediate payment required' : 
                               (riskLevel === 'MEDIUM' ? 'Review payment plans' : 'No immediate action needed'),
                nextPaymentDue: upcomingPayments.length > 0 ? upcomingPayments[0].dueDate : null,
                canAffordAllPayments: projectedCashAfterPayments >= 0
            }
        };

        // Check and send financial alert email (non-blocking)
        checkAndSendFinancialAlert(user, responseData).catch(err => {
            console.error('Error in email alert check:', err);
        });

        // Send response to client
        res.json(responseData);

    } catch (error) {
        console.error('Payment Radar Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error retrieving payment radar data',
            error: error.message
        });
    }
};

module.exports = {
    getSummary,
    getAlerts,
    getInventoryRisk,
    getCashProjection,
    logSale,
    updateStock,
    getStatus,
    getInventory,
    getSalesAnalytics,
    getExpenseAnalytics,
    getInventoryAnalytics,
    getCashFlowAnalytics,
    getPaymentRadar
};
