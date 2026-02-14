const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        default: function() { 
            const d = new Date();
            d.setDate(d.getDate() + 7);
            return d;
        },
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue'],
        default: 'Pending',
    },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
