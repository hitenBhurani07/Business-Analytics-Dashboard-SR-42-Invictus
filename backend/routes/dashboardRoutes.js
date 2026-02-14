const express = require('express');
const router = express.Router();
const {
    getSummary,
    getAlerts,
    getInventoryRisk,
    getCashProjection,
    logSale,
    updateStock,
    getStatus
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/alerts', protect, getAlerts);
router.get('/inventory-risk', protect, getInventoryRisk);
router.get('/cash-projection', protect, getCashProjection);
router.post('/log-sale', protect, logSale);
router.post('/update-stock', protect, updateStock);
router.get('/status', protect, getStatus);

module.exports = router;
