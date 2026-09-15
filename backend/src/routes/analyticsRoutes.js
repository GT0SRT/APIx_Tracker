const express = require('express');
const {
  getIndexTrend,
  getElasticity,
  getSummaryKpis,
  getFareDecomposition,
  getSeriesComparison,
} = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Macro Index Endpoints (National Overview)
router.get('/index-trend', getIndexTrend);
router.get('/trend', getIndexTrend);
router.get('/summary', getSummaryKpis);
router.get('/fare-decomposition', getFareDecomposition);
router.get('/elasticity', getElasticity);

// Sensitive Granular Multi-Tier Series Comparison (Admin Only)
router.get('/series', verifyToken, getSeriesComparison);

module.exports = router;

