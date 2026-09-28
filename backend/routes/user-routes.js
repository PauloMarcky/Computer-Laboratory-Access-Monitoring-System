const express = require('express');
const userController = require('../controllers/user-controller');
const { authenticate, authorize } = require('../middleware/user-auth');

const router = express.Router();

router.post('/login', userController.login);
router.post('/', authenticate, authorize('ADMIN'), userController.createUser);
router.delete('/', authenticate, authorize('ADMIN'), userController.deleteUser);
router.get('/', authenticate, authorize('ADMIN'), userController.listUsers);

module.exports = router;
