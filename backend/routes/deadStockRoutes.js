const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeDeadStock } = require('../controllers/deadStockController');

const router = express.Router();

// Dead Stock Analysis Route
router.post('/analyze', protect, analyzeDeadStock);

module.exports = router;
