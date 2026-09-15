const express = require('express');
const { getRoutes, getRouteParity } = require('../controllers/routesController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// DGCA Monitored Corridors listing (Public for Overview & Macro index weights)
router.get('/', getRoutes);

// Sensitive Cross-Carrier Parity Surveillance & Monopoly Risk Flags (Admin Only)
router.get('/parity', verifyToken, getRouteParity);

module.exports = router;
