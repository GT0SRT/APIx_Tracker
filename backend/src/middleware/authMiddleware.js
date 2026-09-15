const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apix_jwt_super_secret_key_sih2026';

/**
 * Strict Admin Token Verification Middleware.
 * Required for all sensitive operational, route-level, and audit endpoints.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Admin authentication required.',
    });
  }

  // Handle "Bearer <token>" or raw token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Missing bearer authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Insufficient administrative privileges.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid authentication token signature.';

    return res.status(401).json({
      success: false,
      error: message,
    });
  }
};

/**
 * Permissive / Optional Token Verification Middleware.
 * Used for dual-mode endpoints (e.g. AI Copilot) that provide a public baseline
 * for unauthenticated visitors and unlock privileged route telemetry for Admins.
 */
const optionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }

  next();
};

module.exports = {
  verifyToken,
  optionalToken,
  JWT_SECRET,
};
