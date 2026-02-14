const mongoose = require('mongoose');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Sales = require('./models/Sales');
const Expense = require('./models/Expense');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('\n--- Latest Users ---');
        const users = await User.find().sort({ createdAt: -1 }).limit(3);
        console.log(users);

        if (users.length > 0) {
            const ownerId = users[0]._id;
            console.log(`\n--- Inventory for User ${users[0].name} ---`);
            const inventory = await Inventory.find({ ownerId });
            console.log(inventory);

            console.log(`\n--- Sales for User ${users[0].name} ---`);
            const sales = await Sales.find({ ownerId });
            console.log(sales);

            console.log(`\n--- Expenses for User ${users[0].name} ---`);
            const expenses = await Expense.find({ ownerId });
            console.log(expenses);
        } else {
            console.log('No users found.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyData();
