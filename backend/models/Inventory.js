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

    reorderPoint: {
        type: Number,
        default: 10, // Default reorder point
    },
    baseReorderPoint: {
        type: Number,
        default: 10, // Original/base reorder point
    },
    currentSeason: {
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter'],
        default: 'summer',
    },
    seasonalMultipliers: {
        spring: { type: Number, default: 1.0 },
        summer: { type: Number, default: 1.0 },
        autumn: { type: Number, default: 1.0 },
        winter: { type: Number, default: 1.0 },
    },
    aiInsights: {
        lastAnalyzed: { type: Date },
        recommendations: { type: String },
        demandPattern: { type: String }, 
    },
    category: {
        type: String, 
    },
    lastRestocked: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Inventory', InventorySchema);
