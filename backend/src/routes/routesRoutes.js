const express = require('express');
const { getRoutes, getRouteParity } = require('../controllers/routesController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Sensitive Route Intelligence endpoints (Admin Only)
router.get('/', verifyToken, getRoutes);
router.get('/parity', verifyToken, getRouteParity);

module.exports = router;
