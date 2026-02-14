const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createInventory,
    getInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    createSales,
    getSales,
    getSalesById,
    updateSales,
    deleteSales,
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} = require('../controllers/dataController');

const router = express.Router();

// Inventory Routes
router.post('/inventory', protect, createInventory);
router.get('/inventory', protect, getInventory);
router.get('/inventory/:id', protect, getInventoryById);
router.put('/inventory/:id', protect, updateInventory);
router.delete('/inventory/:id', protect, deleteInventory);

// Sales Routes
router.post('/sales', protect, createSales);
router.get('/sales', protect, getSales);
router.get('/sales/:id', protect, getSalesById);
router.put('/sales/:id', protect, updateSales);
router.delete('/sales/:id', protect, deleteSales);

// Expense Routes
router.post('/expenses', protect, createExpense);
router.get('/expenses', protect, getExpenses);
router.get('/expenses/:id', protect, getExpenseById);
router.put('/expenses/:id', protect, updateExpense);
router.delete('/expenses/:id', protect, deleteExpense);

module.exports = router;
