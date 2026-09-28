const prisma = require('../config/db');
const { runScanner } = require('../services/scanner-service');

// Runs the scanner and returns the scanned schoolId, plus the matching user if one exists.
async function scan(req, res) {
  const result = await runScanner();
  if (!result.ok) return res.status(422).json({ error: result.error || 'Scan failed.' });

  const user = await prisma.user.findUnique({
    where: { schoolId: String(result.schoolId).trim() },
    select: { id: true, schoolId: true, role: true, studentProfile: { select: { id: true, firstName: true, lastName: true } } },
  });
  return res.json({ schoolId: result.schoolId, user });
}

module.exports = { scan };
