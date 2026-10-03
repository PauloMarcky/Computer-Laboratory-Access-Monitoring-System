require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(async (error) => {
  console.error('Database connection failed; server was not started:', error.message);
  await prisma.$disconnect();
  process.exitCode = 1;
});