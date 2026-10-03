const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const authorize = require('./authorize');
const { isCurrentTokenVersion } = require('../utils/token-version');

async function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'A bearer token is required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Authentication is not configured.' });
  }

  let payload;
  try {
    payload = jwt.verify(match[1], secret, {
      issuer: 'clams-api',
      audience: 'clams-client',
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const userId = Number(payload.sub);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, schoolId: true, role: true, tokenVersion: true },
    });
    if (!user || !isCurrentTokenVersion(payload.tokenVersion, user.tokenVersion)) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authenticate, authorize };
