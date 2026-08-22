const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.send('CLAMS Backend API is up and running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON: http://localhost:${PORT}`);
});