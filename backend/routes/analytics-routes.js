const express = require('express');
const c = require('../controllers/analytics-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();

router.get('/overview', authenticate, authorize('ADMIN'), a(c.getOverview));

module.exports = router;