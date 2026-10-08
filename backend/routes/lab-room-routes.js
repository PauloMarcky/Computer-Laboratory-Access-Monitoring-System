const express = require('express');
const c = require('../controllers/lab-room-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.use(authenticate);

router.get('/', a(c.listLabRooms));
router.get('/status', a(c.getLabRoomStatus)); // ← must be before /:id
router.get('/:id', a(c.getLabRoom));
router.post('/', authorize('ADMIN'), a(c.createLabRoom));
router.patch('/:id', authorize('ADMIN'), a(c.updateLabRoom));
router.delete('/:id', authorize('ADMIN'), a(c.deleteLabRoom));

module.exports = router;