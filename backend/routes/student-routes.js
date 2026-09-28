const express = require('express');
const c = require('../controllers/student-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/me', authorize('STUDENT'), a(c.getMyStudentProfile));
router.post('/', authorize('ADMIN'), a(c.createStudent));
router.get('/', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.listStudents));
router.get('/:id', authorize('ADMIN', 'INSTRUCTOR', 'CUSTODIAN'), a(c.getStudent));
router.patch('/:id', authorize('ADMIN'), a(c.updateStudent));
router.delete('/:id', authorize('ADMIN'), a(c.deleteStudent));

module.exports = router;
