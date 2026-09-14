const express = require('express');
const {
  getRecentLogs,
  ingestObservations,
  getTelemetry,
  verifyHash,
  getScraperRuns,
  clearDatabaseObservations,
} = require('../controllers/logsController');

const router = express.Router();

router.get('/', getRecentLogs);
router.get('/recent', getRecentLogs);
router.get('/feed', getRecentLogs);
router.get('/telemetry', getTelemetry);
router.get('/runs', getScraperRuns);
router.post('/ingest', ingestObservations);
router.post('/verify-hash', verifyHash);
router.post('/clear', clearDatabaseObservations);

module.exports = router;
