const express = require('express');
const c = require('../controllers/scan-attendance-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();

// Only handles POST /scan-image. Any other path falls through to attendance-routes.js.
router.post(
  '/scan-image',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR'),
  express.raw({ type: 'image/jpeg', limit: '3mb' }),
  a(c.scanImageForSchedule),
);
router.post('/manual', authenticate, authorize('ADMIN', 'INSTRUCTOR'), a(c.manualTimeIn));

module.exports = router;