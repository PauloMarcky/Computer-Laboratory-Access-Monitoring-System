const express = require('express');
const c = require('../controllers/enrollment-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate, authorize('ADMIN', 'INSTRUCTOR'));

router.post('/', a(c.enroll));
router.get('/schedule/:scheduleId', a(c.listBySchedule));
router.delete('/:id', a(c.unenroll));

module.exports = router;
