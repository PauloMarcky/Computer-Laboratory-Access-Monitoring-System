const express = require('express');
const c = require('../controllers/instructor-subject-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();

router.get('/workload', authenticate, authorize('ADMIN'), a(c.listWorkload));
router.get('/:id/subjects', authenticate, a(c.listInstructorSubjects));
router.post('/:id/subjects', authenticate, authorize('ADMIN'), a(c.assignSubject));
router.delete('/:id/subjects/:subjectId', authenticate, authorize('ADMIN'), a(c.unassignSubject));

module.exports = router;