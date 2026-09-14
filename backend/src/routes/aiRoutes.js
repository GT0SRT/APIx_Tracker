const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Health and tool introspection
router.get('/health', aiController.getAiHealth);

// Main agent copilot interaction endpoint
router.post('/chat', aiController.chatWithAgent);
router.post('/', aiController.chatWithAgent);

module.exports = router;
