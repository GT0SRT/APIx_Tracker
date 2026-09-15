const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Admin Login endpoint
router.post('/login', login);

// Protected Admin session validation endpoint
router.get('/me', verifyToken, getMe);
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({ success: true, valid: true, user: req.user });
});

module.exports = router;
