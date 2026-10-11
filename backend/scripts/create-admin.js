// Creates the first administrator. Credentials come from the environment, never from source code.
// Usage: docker compose exec -e ADMIN_SCHOOL_ID=... -e ADMIN_PASSWORD=... api node scripts/create-admin.js
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

async function main() {
  const schoolId = (process.env.ADMIN_SCHOOL_ID || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!schoolId || schoolId.length > 191) {
    throw new Error('Set ADMIN_SCHOOL_ID (1-191 characters).');
  }
  if (password.length < 12 || password.length > 72) {
    throw new Error('Set ADMIN_PASSWORD (12-72 characters).');
  }

  const existing = await prisma.user.findUnique({ where: { schoolId } });
  if (existing) throw new Error(`A user with school ID ${schoolId} already exists.`);

  await prisma.user.create({
    data: { schoolId, password: await bcrypt.hash(password, 12), role: 'ADMIN' },
  });
  console.log(`Administrator ${schoolId} created.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());