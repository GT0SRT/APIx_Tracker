const express = require('express');
const { getRecentLogs, ingestObservations } = require('../controllers/logsController');

const router = express.Router();

router.get('/recent', getRecentLogs);
router.post('/ingest', ingestObservations);

module.exports = router;
