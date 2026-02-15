const express = require('express');
const router = express.Router();
const {
    getSummary,
    getAlerts,
    getInventoryRisk,
    getCashProjection,
    logSale,
    updateStock,
    getStatus,
    getInventory,
    getSalesAnalytics,
    getExpenseAnalytics,
    getInventoryAnalytics,
    getCashFlowAnalytics,
    getPaymentRadar,
    sendPaymentRadarEmail
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/alerts', protect, getAlerts);
router.get('/inventory-risk', protect, getInventoryRisk);
router.get('/cash-projection', protect, getCashProjection);
router.post('/log-sale', protect, logSale);
router.post('/update-stock', protect, updateStock);
router.get('/status', protect, getStatus);
router.get('/inventory', protect, getInventory);

// Analytics routes
router.get('/analytics/sales', protect, getSalesAnalytics);
router.get('/analytics/expenses', protect, getExpenseAnalytics);
router.get('/analytics/inventory', protect, getInventoryAnalytics);
router.get('/analytics/cashflow', protect, getCashFlowAnalytics);

// Payment Radar routes
router.get('/payment-radar', protect, getPaymentRadar);
router.post('/send-payment-radar-email', protect, sendPaymentRadarEmail);

module.exports = router;
