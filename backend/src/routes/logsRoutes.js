const express = require('express');
const {
  getRecentLogs,
  ingestObservations,
  getTelemetry,
  verifyHash,
} = require('../controllers/logsController');

const router = express.Router();

router.get('/', getRecentLogs);
router.get('/recent', getRecentLogs);
router.get('/feed', getRecentLogs);
router.get('/telemetry', getTelemetry);
router.post('/ingest', ingestObservations);
router.post('/verify-hash', verifyHash);

module.exports = router;
