const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/login (and /api/v1/auth/login)
 * Authenticates Admin user using email and password, returning a signed JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Generate signed JWT (24-hour expiration)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'ADMIN',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'ADMIN',
      },
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during authentication.',
    });
  }
};

/**
 * GET /api/auth/me (and /api/v1/auth/me)
 * Returns the authenticated Admin session profile.
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthenticated session.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[AuthController] getMe error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve session profile.',
    });
  }
};

module.exports = {
  login,
  getMe,
};
