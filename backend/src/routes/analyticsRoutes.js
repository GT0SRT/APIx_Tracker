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

// Sensitive Granular Analytics Endpoints (Admin Only)
router.get('/elasticity', verifyToken, getElasticity);
router.get('/fare-decomposition', verifyToken, getFareDecomposition);
router.get('/series', verifyToken, getSeriesComparison);

module.exports = router;

