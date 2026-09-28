const express = require('express');
const c = require('../controllers/scanner-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.post('/scan', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.scan));

module.exports = router;
