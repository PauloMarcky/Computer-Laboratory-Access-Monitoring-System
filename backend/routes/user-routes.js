const express = require('express');
const userController = require('../controllers/user-controller');
const { authenticate, authorize } = require('../middleware/user-auth');
const { asyncHandler } = require('../middleware/error-handler');

const router = express.Router();

router.post('/login', asyncHandler(userController.login));
router.use(authenticate);
router.get('/', authorize('ADMIN'), asyncHandler(userController.listUsers));
router.post('/', authorize('ADMIN'), asyncHandler(userController.createUser));
router.patch('/:id/password', authorize('ADMIN'), asyncHandler(userController.updatePassword));

module.exports = router;
