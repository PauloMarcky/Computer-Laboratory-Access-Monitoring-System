const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/error-handler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users', require('./routes/user-routes'));
app.use('/api/students', require('./routes/student-routes'));
app.use('/api/instructors', require('./routes/instructor-routes'));
app.use('/api/lab-rooms', require('./routes/lab-room-routes'));
app.use('/api/schedules', require('./routes/schedule-routes'));
app.use('/api/enrollments', require('./routes/enrollment-routes'));
app.use('/api/sessions', require('./routes/session-routes'));
app.use('/api/attendance', require('./routes/scan-attenadance-routes'));
app.use('/api/attendance', require('./routes/attendance-routes'));
app.use('/api/pc-occupancy', require('./routes/pc-occupancy-routes'));
app.use('/api/pc-issues', require('./routes/pc-issue-routes'));
app.use('/api/scanner', require('./routes/scanner-routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;