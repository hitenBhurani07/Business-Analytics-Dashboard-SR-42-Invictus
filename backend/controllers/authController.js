const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require('fs');

// Generate JWT
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};

// @desc    Register new user & upload initial data
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, businessName, businessType, startingCash } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            businessName,
            businessType,
            startingCash,
        });

        // Helper to verify file exists before processing
        const safelyProcess = (fileKey, processFn) => {
            // if (req.files[fileKey] && req.files[fileKey][0]) {
            if (req.files && req.files[fileKey] && req.files[fileKey][0]) {
                const file = req.files[fileKey][0];
                console.log(`Processing ${fileKey}...`);

                return new Promise((resolve, reject) => {
                    const results = [];
                    fs.createReadStream(file.path)
                        .pipe(csv())
                        .on('data', (data) => results.push(processFn(data)))
                        .on('end', async () => {
                            try {
                                if (results.length > 0) {
                                    if (fileKey === 'inventory') await Inventory.insertMany(results);
                                    if (fileKey === 'sales') await Sales.insertMany(results);
                                    if (fileKey === 'expenses') await Expense.insertMany(results);
                                    console.log(`Inserted ${results.length} ${fileKey} records.`);
                                }
                                fs.unlinkSync(file.path);
                                resolve();
                            } catch (err) {
                                console.error(`Error saving ${fileKey}:`, err);
                                reject(err);
                            }
                        })
                        .on('error', (err) => {
                            console.error(`Error reading ${fileKey}:`, err);
                            reject(err);
                        });
                });
            }
            return Promise.resolve();
        };

        const tasks = [];

        tasks.push(safelyProcess('inventory', (data) => ({
            ownerId: user._id,
            itemName: data.itemName || data.ItemName || data.name || data.item_name || 'Unknown Item',
            quantity: Number(data.quantity || data.Quantity || data.current_stock || 0),
            dailyUsage: Number(data.dailyUsage || data.DailyUsage || data.min_stock_level || 5),
            costPrice: Number(data.costPrice || data.CostPrice || data.unit_cost || 0),
            sellingPrice: Number(data.sellingPrice || data.SellingPrice || (data.unit_cost ? data.unit_cost * 1.5 : 0)),
        })));

        tasks.push(safelyProcess('sales', (data) => ({
            ownerId: user._id,
            itemName: data.itemName || data.ItemName || data.item_name || 'Unknown Item',
            quantity: Number(data.quantity || data.Quantity || 1),
            totalAmount: Number(data.totalAmount || data.TotalAmount || data.total_revenue || 0),
            date: data.date || data.timestamp ? new Date(data.date || data.timestamp) : new Date(),
        })));

        tasks.push(safelyProcess('expenses', (data) => ({
            ownerId: user._id,
            title: data.title || data.Title || data.description || 'Expense',
            amount: Number(data.amount || data.Amount || 0),
            category: data.category || data.Category || 'General',
            date: data.date || data.date_incurred ? new Date(data.date || data.date_incurred) : new Date(),
        })));

        await Promise.all(tasks);


        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessName: user.businessName,
            token: generateToken(user._id),
        });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessName: user.businessName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
