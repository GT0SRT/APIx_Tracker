const express = require('express');
const {
  getJevonsCarliComparison,
  getLaspeyresData,
  calculateJevonsFormula,
  calculateLaspeyresMacro,
} = require('../controllers/methodologyController');

const router = express.Router();

router.get('/jevons-carli', getJevonsCarliComparison);
router.get('/laspeyres', getLaspeyresData);
router.post('/calculate-jevons', calculateJevonsFormula);
router.post('/calculate-laspeyres', calculateLaspeyresMacro);

module.exports = router;
