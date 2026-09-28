const express = require('express');
const c = require('../controllers/instructor-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/me', authorize('INSTRUCTOR'), a(c.getMyInstructorProfile));
router.post('/', authorize('ADMIN'), a(c.createInstructor));
router.get('/', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.listInstructors));
router.get('/:id', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.getInstructor));
router.patch('/:id', authorize('ADMIN'), a(c.updateInstructor));
router.delete('/:id', authorize('ADMIN'), a(c.deleteInstructor));

module.exports = router;
