const express = require('express');
const {
  getCpiForecast,
  triggerRetraining,
  getCpiHistory,
} = require('../controllers/forecastController');
const { optionalToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: Fetch latest CPI forecast trajectory with confidence bounds
router.get('/cpi', getCpiForecast);
router.get('/', getCpiForecast);

// Public: Historical monthly CPI series
router.get('/history', getCpiHistory);

// Admin / Trigger: Run SARIMAX model retraining and save updated predictions
router.post('/train', optionalToken, triggerRetraining);
router.post('/retrain', optionalToken, triggerRetraining);

module.exports = router;
