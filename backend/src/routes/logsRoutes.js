const express = require('express');
const {
  getRecentLogs,
  ingestObservations,
  getTelemetry,
  verifyHash,
  getScraperRuns,
  clearDatabaseObservations,
} = require('../controllers/logsController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Sensitive Audit and Ingestion Telemetry routes (Admin Only)
router.get('/', verifyToken, getRecentLogs);
router.get('/recent', verifyToken, getRecentLogs);
router.get('/feed', verifyToken, getRecentLogs);
router.get('/telemetry', verifyToken, getTelemetry);
router.get('/runs', verifyToken, getScraperRuns);
router.post('/ingest', ingestObservations); // Ingestion pipeline protected via x-ingest-token
router.post('/verify-hash', verifyToken, verifyHash);
router.post('/clear', verifyToken, clearDatabaseObservations);

module.exports = router;

