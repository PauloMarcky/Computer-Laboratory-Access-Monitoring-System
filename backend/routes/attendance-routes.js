const express = require('express');
const c = require('../controllers/attendance-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.post('/time-in', authorize('STUDENT'), a(c.timeIn));
router.post('/time-out', authorize('STUDENT'), a(c.timeOut));
router.get('/me', authorize('STUDENT'), a(c.listMine));
router.get('/session/:sessionId', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.listBySession));

module.exports = router;