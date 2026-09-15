const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalToken } = require('../middleware/authMiddleware');

// Health and tool introspection (Public)
router.get('/health', aiController.getAiHealth);

// Main agent copilot interaction endpoint (Supports Public viewers with restricted scope and Admin with full access)
router.post('/chat', optionalToken, aiController.chatWithAgent);
router.post('/', optionalToken, aiController.chatWithAgent);

module.exports = router;

