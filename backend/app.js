const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/error-handler');

const app = express();
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS must be configured in production.');
}
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:3001,http://127.0.0.1:3001,http://10.35.225.159:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(express.json({ limit: '100kb' }));

const scanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 900,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Scanner request limit reached. Try again later.' },
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/attendance/scan-image', scanLimiter);
app.use('/api/users', require('./routes/user-routes'));
app.use('/api/students', require('./routes/student-routes'));
app.use('/api/instructors', require('./routes/instructor-routes'));
app.use('/api/instructor-subjects', require('./routes/instructor-subject-routes'));  // ← ADD THIS
app.use('/api/lab-rooms', require('./routes/lab-room-routes'));
app.use('/api/schedules', require('./routes/schedule-routes'));
app.use('/api/enrollments', require('./routes/enrollment-routes'));
app.use('/api/sessions', require('./routes/session-routes'));
app.use('/api/attendance', require('./routes/scan-attenadance-routes'));
app.use('/api/attendance', require('./routes/attendance-routes'));
app.use('/api/pc-occupancy', require('./routes/pc-occupancy-routes'));
app.use('/api/pc-issues', require('./routes/pc-issue-routes'));
app.use('/api/scanner', require('./routes/scanner-routes'));
app.use('/api/subjects', require('./routes/subject-routes'));
app.use('/api/terms', require('./routes/term-routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;