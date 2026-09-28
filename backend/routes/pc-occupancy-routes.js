const express = require('express');
const c = require('../controllers/pc-occupancy-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.post('/claim', authorize('STUDENT'), a(c.claimPc));
router.patch('/:id/release', authorize('STUDENT', 'ADMIN', 'INSTRUCTOR'), a(c.releasePc));
router.get('/session/:sessionId', a(c.listBySession));

module.exports = router;
