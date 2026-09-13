const express = require('express');
const {
  getIndexTrend,
  getElasticity,
  getSummaryKpis,
  getFareDecomposition,
  getSeriesComparison,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/index-trend', getIndexTrend);
router.get('/trend', getIndexTrend);
router.get('/elasticity', getElasticity);
router.get('/summary', getSummaryKpis);
router.get('/fare-decomposition', getFareDecomposition);
router.get('/series', getSeriesComparison);

module.exports = router;
