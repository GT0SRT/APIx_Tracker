const express = require('express');
const { getRoutes, getRouteParity } = require('../controllers/routesController');

const router = express.Router();

router.get('/', getRoutes);
router.get('/parity', getRouteParity);

module.exports = router;
