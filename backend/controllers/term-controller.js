const prisma = require('../config/db');

async function listTerms(req, res) {
  const terms = await prisma.term.findMany({
    orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
  });
  return res.json({ terms });
}

module.exports = { listTerms };