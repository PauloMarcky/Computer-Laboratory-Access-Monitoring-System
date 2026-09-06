require('dotenv').config();
const mysql = require('mysql2/promise');

// Create the connection pool using your .env variable
const pool = mysql.createPool(process.env.DATABASE_URL);

// Function to verify connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

// Run test on initialization
testConnection();

module.exports = pool;