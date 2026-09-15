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
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    let user = null;
    let isPasswordValid = false;

    // 1. Check Database via Prisma if available, with resilient raw SQL fallback
    try {
      if (prisma && prisma.user) {
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      }
      if (!user && prisma && prisma.$queryRawUnsafe) {
        const rows = await prisma.$queryRawUnsafe(
          'SELECT id, email, password_hash, role FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1',
          cleanEmail
        );
        if (rows && rows.length > 0) {
          user = rows[0];
        }
      }
    } catch (dbError) {
      console.warn('[AuthController] Database query error (attempting raw SQL fallback):', dbError.message);
      try {
        if (prisma && prisma.$queryRawUnsafe) {
          const rows = await prisma.$queryRawUnsafe(
            'SELECT id, email, password_hash, role FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1',
            cleanEmail
          );
          if (rows && rows.length > 0) {
            user = rows[0];
          }
        }
      } catch (rawErr) {
        console.warn('[AuthController] Raw SQL fallback error:', rawErr.message);
      }
    }

    // 2. Validate against bcrypt hash from Database
    if (user && user.password_hash) {
      try {
        isPasswordValid = await bcrypt.compare(String(password), user.password_hash);
      } catch (bcryptError) {
        console.warn('[AuthController] bcrypt compare error:', bcryptError.message);
      }
    }

    // 3. Environment Variable Fallback Validation
    if (!isPasswordValid && envAdminEmail && cleanEmail === envAdminEmail && envAdminPassword) {
      if (String(password) === String(envAdminPassword)) {
        isPasswordValid = true;
        if (!user) {
          user = {
            id: 1,
            email: envAdminEmail,
            role: 'ADMIN',
          };
        }
      }
    }

    // If credentials did not match, return 401 Unauthorized
    if (!isPasswordValid || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Generate signed JWT (24-hour expiration)
    const token = jwt.sign(
      {
        id: user.id || 1,
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
        id: user.id || 1,
        email: user.email,
        role: user.role || 'ADMIN',
      },
    });
  } catch (error) {
    console.error('[AuthController] Login unexpected error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please verify credentials.',
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

    let user = null;
    try {
      if (prisma && prisma.user && req.user.id) {
        user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, email: true, role: true, createdAt: true },
        });
      }
      if (!user && prisma && prisma.$queryRawUnsafe && req.user.id) {
        const rows = await prisma.$queryRawUnsafe(
          'SELECT id, email, role, "createdAt" FROM "User" WHERE id = $1 LIMIT 1',
          req.user.id
        );
        if (rows && rows.length > 0) {
          user = rows[0];
        }
      }
    } catch (err) {
      console.warn('[AuthController] getMe database query failed:', err.message);
    }

    return res.status(200).json({
      success: true,
      user: user || {
        id: req.user.id || 1,
        email: req.user.email,
        role: req.user.role || 'ADMIN',
      },
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
