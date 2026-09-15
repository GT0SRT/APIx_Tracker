const express = require('express');
const {
  getJevonsCarliComparison,
  getLaspeyresData,
  calculateJevonsFormula,
  calculateLaspeyresMacro,
} = require('../controllers/methodologyController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Sensitive Advanced Methodology & Mathematical Computation routes (Admin Only)
router.get('/jevons-carli', verifyToken, getJevonsCarliComparison);
router.get('/laspeyres', verifyToken, getLaspeyresData);
router.post('/calculate-jevons', verifyToken, calculateJevonsFormula);
router.post('/calculate-laspeyres', verifyToken, calculateLaspeyresMacro);

module.exports = router;

