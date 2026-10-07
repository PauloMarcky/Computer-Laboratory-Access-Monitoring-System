const express = require('express');
const c = require('../controllers/session-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/me/active', authorize('STUDENT'), a(c.listMyActiveSessions));
router.get('/reports', authorize('ADMIN', 'CUSTODIAN'), a(c.listReports));
router.get('/', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.listSessions));
router.get('/:id', a(c.getSession));
router.post('/', authorize('ADMIN', 'INSTRUCTOR'), a(c.startSession));
router.patch('/:id/end', authorize('ADMIN', 'INSTRUCTOR'), a(c.endSession));

module.exports = router;