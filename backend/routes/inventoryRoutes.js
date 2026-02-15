const express = require('express');
const router = express.Router();
const {
  addInventoryItem,
  getInventory,
  updateInventoryItem,
  deleteInventoryItem,
  analyzeItem,
  analyzeAllInventory,
  getLowStockAlerts,
} = require('../controllers/inventoryController');

// Import auth middleware 
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (login required)

// @route   POST /api/inventory
// @desc    Add new inventory item
router.post('/', protect, addInventoryItem);

// @route   GET /api/inventory
// @desc    Get all inventory items
router.get('/', protect, getInventory);

// @route   GET /api/inventory/alerts
// @desc    Get low stock alerts
router.get('/alerts', protect, getLowStockAlerts);

// @route   POST /api/inventory/analyze-all
// @desc    Run AI analysis on all items (bulk)
router.post('/analyze-all', protect, analyzeAllInventory);

// @route   POST /api/inventory/:id/analyze
// @desc    Run AI analysis on single item
router.post('/:id/analyze', protect, analyzeItem);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
router.put('/:id', protect, updateInventoryItem);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
router.delete('/:id', protect, deleteInventoryItem);

module.exports = router;