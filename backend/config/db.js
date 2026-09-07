require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify database connection on initialization
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to MySQL database via Prisma!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();

module.exports = prisma;