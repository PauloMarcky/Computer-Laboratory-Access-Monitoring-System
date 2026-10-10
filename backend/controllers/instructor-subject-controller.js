const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

// GET /api/instructor-subjects/workload
async function listWorkload(req, res) {
  const instructors = await prisma.instructorProfile.findMany({
    include: {
      user: { select: { schoolId: true } },
      instructorSubjects: {
        include: { subject: true },
        orderBy: { subject: { code: 'asc' } },
      },
      schedules: { where: { isActive: true }, select: { scheduleId: true } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const result = instructors.map((i) => ({
    id: i.id,
    name: `${i.firstName} ${i.lastName}`,
    firstName: i.firstName,
    lastName: i.lastName,
    department: i.department || '',
    schoolId: i.user.schoolId,
    subjects: i.instructorSubjects
      .filter((link) => link.subject.isActive)
      .map((link) => ({
        id: link.subject.id,
        code: link.subject.code,
        title: link.subject.title,
        yearLevel: link.subject.yearLevel,
      })),
    scheduleCount: i.schedules.length,
  }));

  return res.json({ instructors: result });
}

// GET /api/instructor-subjects/:id/subjects
async function listInstructorSubjects(req, res) {
  const instructorId = toId(req.params.id);
  if (!instructorId) return res.status(400).json({ error: 'Invalid instructor id.' });

  const rows = await prisma.instructorSubject.findMany({
    where: { instructorId, subject: { isActive: true } },
    include: { subject: true },
    orderBy: { subject: { code: 'asc' } },
  });
  return res.json({ subjects: rows.map((r) => r.subject) });
}

// POST /api/instructor-subjects/:id/subjects  body: { subjectId }
async function assignSubject(req, res) {
  const instructorId = toId(req.params.id);
  const subjectId = toId(req.body?.subjectId);
  if (!instructorId || !subjectId) {
    return res.status(400).json({ error: 'instructorId and subjectId are required.' });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || !subject.isActive) {
    return res.status(404).json({ error: 'Subject not found or archived.' });
  }

  try {
    const link = await prisma.instructorSubject.create({
      data: { instructorId, subjectId },
      include: { subject: true },
    });
    return res.status(201).json({
      link: {
        id: link.id,
        subject: {
          id: link.subject.id,
          code: link.subject.code,
          title: link.subject.title,
          yearLevel: link.subject.yearLevel,
        },
      },
    });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Already assigned.' });
    if (e.code === 'P2003') return res.status(404).json({ error: 'Instructor or subject not found.' });
    throw e;
  }
}

// DELETE /api/instructor-subjects/:id/subjects/:subjectId
async function unassignSubject(req, res) {
  const instructorId = toId(req.params.id);
  const subjectId = toId(req.params.subjectId);
  if (!instructorId || !subjectId) return res.status(400).json({ error: 'Invalid ids.' });

  await prisma.instructorSubject.deleteMany({ where: { instructorId, subjectId } });
  return res.status(204).send();
}

module.exports = { listWorkload, listInstructorSubjects, assignSubject, unassignSubject };