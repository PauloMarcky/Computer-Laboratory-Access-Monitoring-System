// server.js
require('dotenv').config();
const express = require('express');

// Requiring config/db runs testConnection() and gives you access to pool
const pool = require('./config/db');

const app = express();
app.use(express.json());

// Example route using the imported pool
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});