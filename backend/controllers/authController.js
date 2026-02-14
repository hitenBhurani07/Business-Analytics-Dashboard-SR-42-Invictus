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
    return jwt.sign({ id }, process.env.JWT_SECRET, {
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

        if (user) {
            // Process uploaded files if they exist
            if (req.files) {
                const processFile = (file, Model, mapData) => {
                    return new Promise((resolve, reject) => {
                        const results = [];
                        fs.createReadStream(file.path)
                            .pipe(csv())
                            .on('data', (data) => results.push(mapData(data)))
                            .on('end', async () => {
                                try {
                                    if (results.length > 0) {
                                        await Model.insertMany(results);
                                    }
                                    // Delete file after processing
                                    fs.unlinkSync(file.path);
                                    resolve();
                                } catch (error) {
                                    reject(error);
                                }
                            })
                            .on('error', (error) => reject(error));
                    });
                };

                const tasks = [];

                if (req.files['inventory']) {
                    tasks.push(
                        processFile(req.files['inventory'][0], Inventory, (data) => ({
                            ownerId: user._id,
                            itemName: data.itemName || data.ItemName || data.name, // Handle different casing
                            quantity: Number(data.quantity || data.Quantity),
                            costPrice: Number(data.costPrice || data.CostPrice),
                            sellingPrice: Number(data.sellingPrice || data.SellingPrice),
                        }))
                    );
                }

                if (req.files['sales']) {
                    tasks.push(
                        processFile(req.files['sales'][0], Sales, (data) => ({
                            ownerId: user._id,
                            itemName: data.itemName || data.ItemName,
                            quantity: Number(data.quantity || data.Quantity),
                            totalAmount: Number(data.totalAmount || data.TotalAmount),
                            date: data.date ? new Date(data.date) : new Date(),
                        }))
                    );
                }

                if (req.files['expenses']) {
                    tasks.push(
                        processFile(req.files['expenses'][0], Expense, (data) => ({
                            ownerId: user._id,
                            title: data.title || data.Title,
                            amount: Number(data.amount || data.Amount),
                            category: data.category || data.Category,
                            date: data.date ? new Date(data.date) : new Date(),
                        }))
                    );
                }

                await Promise.all(tasks);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessName: user.businessName,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
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
