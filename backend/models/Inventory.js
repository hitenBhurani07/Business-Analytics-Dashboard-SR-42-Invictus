const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    dailyUsage: {
        type: Number,
        default: 0,
    },
    costPrice: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Inventory', InventorySchema);
