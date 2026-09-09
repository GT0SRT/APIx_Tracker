const express = require('express');
const { getRecentLogs } = require('../controllers/logsController');

const router = express.Router();

router.get('/recent', getRecentLogs);

module.exports = router;
