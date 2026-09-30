const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

// GET /api/enrollments/roster/:scheduleId
async function getRoster(req, res) {
  const scheduleId = toId(req.params.scheduleId);
  if (!scheduleId) return res.status(400).json({ error: 'Invalid schedule id.' });

  const schedule = await prisma.schedule.findUnique({
    where: { scheduleId },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      labRoom: true,
      term: true,
    },
  });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

  const enrollments = await prisma.classEnrollment.findMany({
    where: { scheduleId },
    include: { studentProfile: { include: { user: { select: { schoolId: true } } } } },
    orderBy: { studentProfile: { lastName: 'asc' } },
  });

  const enrolledIds = enrollments.map((e) => e.studentProfileId);

  const available = await prisma.studentProfile.findMany({
    where: { id: { notIn: enrolledIds } },
    include: { user: { select: { schoolId: true } } },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  return res.json({
    schedule: {
      id: schedule.scheduleId,
      subjectCode: schedule.subjectCode,
      section: schedule.section,
      yearLevel: schedule.yearLevel,
      instructor: schedule.instructor,
      labRoom: schedule.labRoom,
      term: schedule.term,
    },
    enrolled: enrollments.map((e) => ({
      enrollmentId: e.id,
      studentProfileId: e.studentProfileId,
      schoolId: e.studentProfile.user.schoolId,
      firstName: e.studentProfile.firstName,
      lastName: e.studentProfile.lastName,
      yearLevel: e.studentProfile.yearLevel,
    })),
    available: available.map((p) => ({
      studentProfileId: p.id,
      schoolId: p.user.schoolId,
      firstName: p.firstName,
      lastName: p.lastName,
      yearLevel: p.yearLevel,
    })),
  });
}

// POST /api/enrollments  body: { scheduleId, studentProfileIds: number[] }
async function bulkEnroll(req, res) {
  const scheduleId = toId(req.body?.scheduleId);
  const ids = Array.isArray(req.body?.studentProfileIds) ? req.body.studentProfileIds : [];
  const studentProfileIds = ids.map(toId).filter((x) => x != null);

  if (!scheduleId) return res.status(400).json({ error: 'scheduleId is required.' });
  if (studentProfileIds.length === 0) return res.status(400).json({ error: 'At least one student is required.' });

  try {
    const result = await prisma.classEnrollment.createMany({
      data: studentProfileIds.map((studentProfileId) => ({ studentProfileId, scheduleId })),
      skipDuplicates: true,
    });
    return res.status(201).json({ created: result.count });
  } catch (e) {
    if (e.code === 'P2003') return res.status(404).json({ error: 'Schedule or student not found.' });
    throw e;
  }
}

// DELETE /api/enrollments/:id
async function removeEnrollment(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid enrollment id.' });

  try {
    await prisma.classEnrollment.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Enrollment not found.' });
    throw e;
  }
}

module.exports = { getRoster, bulkEnroll, removeEnrollment };