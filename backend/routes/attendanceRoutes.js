const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance');


router.post('/scan', attendanceController.verifyAndLogScan);

module.exports = router;