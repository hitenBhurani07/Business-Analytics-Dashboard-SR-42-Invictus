const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const Expense = require('../models/Expense');

// ===== INVENTORY ROUTES =====

// Create Inventory
exports.createInventory = async (req, res) => {
    try {
        const { itemName, quantity, costPrice, sellingPrice } = req.body;
        const userId = req.user.id;

        if (!itemName || quantity === undefined || costPrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const inventory = new Inventory({
            ownerId: userId,
            itemName,
            quantity,
            costPrice,
            sellingPrice,
        });

        await inventory.save();
        res.status(201).json({ message: 'Inventory created', data: inventory });
    } catch (err) {
        res.status(500).json({ message: 'Error creating inventory', error: err.message });
    }
};

// Get All Inventory
exports.getInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const inventory = await Inventory.find({ ownerId: userId });
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inventory', error: err.message });
    }
};

// Get Single Inventory Item
exports.getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inventory', error: err.message });
    }
};

// Update Inventory
exports.updateInventory = async (req, res) => {
    try {
        const { itemName, quantity, costPrice, sellingPrice } = req.body;
        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            { itemName, quantity, costPrice, sellingPrice },
            { new: true }
        );
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json({ message: 'Inventory updated', data: inventory });
    } catch (err) {
        res.status(500).json({ message: 'Error updating inventory', error: err.message });
    }
};

// Delete Inventory
exports.deleteInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json({ message: 'Inventory deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting inventory', error: err.message });
    }
};

// ===== SALES ROUTES =====

// Create Sales
exports.createSales = async (req, res) => {
    try {
        const { itemName, quantity, totalAmount } = req.body;
        const userId = req.user.id;

        if (!itemName || quantity === undefined || totalAmount === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const sales = new Sales({
            ownerId: userId,
            itemName,
            quantity,
            totalAmount,
        });

        await sales.save();
        res.status(201).json({ message: 'Sales created', data: sales });
    } catch (err) {
        res.status(500).json({ message: 'Error creating sales', error: err.message });
    }
};

// Get All Sales
exports.getSales = async (req, res) => {
    try {
        const userId = req.user.id;
        const sales = await Sales.find({ ownerId: userId });
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching sales', error: err.message });
    }
};

// Get Single Sales
exports.getSalesById = async (req, res) => {
    try {
        const sales = await Sales.findById(req.params.id);
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching sales', error: err.message });
    }
};

// Update Sales
exports.updateSales = async (req, res) => {
    try {
        const { itemName, quantity, totalAmount } = req.body;
        const sales = await Sales.findByIdAndUpdate(
            req.params.id,
            { itemName, quantity, totalAmount },
            { new: true }
        );
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }
        res.status(200).json({ message: 'Sales updated', data: sales });
    } catch (err) {
        res.status(500).json({ message: 'Error updating sales', error: err.message });
    }
};

// Delete Sales
exports.deleteSales = async (req, res) => {
    try {
        const sales = await Sales.findByIdAndDelete(req.params.id);
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }
        res.status(200).json({ message: 'Sales deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting sales', error: err.message });
    }
};

// ===== EXPENSE ROUTES =====

// Create Expense
exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const userId = req.user.id;

        if (!title || amount === undefined || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const expense = new Expense({
            ownerId: userId,
            title,
            amount,
            category,
        });

        await expense.save();
        res.status(201).json({ message: 'Expense created', data: expense });
    } catch (err) {
        res.status(500).json({ message: 'Error creating expense', error: err.message });
    }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.find({ ownerId: userId });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching expenses', error: err.message });
    }
};

// Get Single Expense
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching expense', error: err.message });
    }
};

// Update Expense
exports.updateExpense = async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount, category },
            { new: true }
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense updated', data: expense });
    } catch (err) {
        res.status(500).json({ message: 'Error updating expense', error: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting expense', error: err.message });
    }
};
