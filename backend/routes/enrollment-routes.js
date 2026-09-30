const express = require('express');
const c = require('../controllers/enrollment-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/roster/:scheduleId', authorize('ADMIN', 'INSTRUCTOR'), a(c.getRoster));
router.post('/', authorize('ADMIN'), a(c.bulkEnroll));
router.delete('/:id', authorize('ADMIN'), a(c.removeEnrollment));

module.exports = router;