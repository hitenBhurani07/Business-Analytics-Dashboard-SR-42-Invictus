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

        res.json({
            currentCash,
            projectedCash,
            expectedSales,
            upcomingBills,
            status: projectedCash < 0 ? 'red' : (projectedCash < 1000 ? 'yellow' : 'green'),
            projectionPeriod: '2 days',
            avgDailySales: 0,
            avgDailyExpenses: 0
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

module.exports = {
    getSummary,
    getAlerts,
    getInventoryRisk,
    getCashProjection,
    logSale,
    updateStock,
    getStatus
};
