const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const Expense = require('../models/Expense');
const User = require('../models/User');

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
        res.json({ status });
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
    getCashFlowAnalytics
};
