const express = require('express');
const c = require('../controllers/schedule-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/me', authorize('STUDENT'), a(c.listMySchedules));
router.get('/', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.listSchedules));
router.get('/:id', a(c.getSchedule));
router.post('/', authorize('ADMIN'), a(c.createSchedule));
router.patch('/:id', authorize('ADMIN'), a(c.updateSchedule));
router.delete('/:id', authorize('ADMIN'), a(c.deleteSchedule));

module.exports = router;
