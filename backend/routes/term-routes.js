const express = require('express');
const c = require('../controllers/term-controller');
const { authenticate } = require('../middleware/user-auth');
const { asyncHandler: a } = require('../middleware/error-handler');

const router = express.Router();
router.get('/', authenticate, a(c.listTerms));

module.exports = router;