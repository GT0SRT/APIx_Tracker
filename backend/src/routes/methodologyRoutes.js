const express = require('express');
const { calculateJevonsFormula, calculateLaspeyresMacro } = require('../controllers/methodologyController');

const router = express.Router();

router.post('/calculate-jevons', calculateJevonsFormula);
router.post('/calculate-laspeyres', calculateLaspeyresMacro);

module.exports = router;
