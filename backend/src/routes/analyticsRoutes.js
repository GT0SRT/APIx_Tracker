const express = require('express');
const { getIndexTrend, getElasticity } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/index-trend', getIndexTrend);
router.get('/elasticity', getElasticity);

module.exports = router;
