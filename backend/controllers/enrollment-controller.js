const prisma = require('../config/db');
const { toId, getInstructorProfile } = require('../utils/helpers');

// Instructors may only manage enrollments for their own schedules.
async function canManage(user, scheduleId) {
  if (user.role === 'ADMIN') return true;
  const profile = await getInstructorProfile(user.id);
  if (!profile) return false;
  const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
  return !!schedule && schedule.instructorId === profile.id;
}

async function enroll(req, res) {
  const studentProfileId = toId(req.body?.studentProfileId);
  const scheduleId = toId(req.body?.scheduleId);
  if (!studentProfileId || !scheduleId) {
    return res.status(400).json({ error: 'studentProfileId and scheduleId are required.' });
  }
  if (!(await canManage(req.user, scheduleId))) {
    return res.status(403).json({ error: 'You cannot manage this schedule.' });
  }
  const existing = await prisma.classEnrollment.findFirst({ where: { studentProfileId, scheduleId } });
  if (existing) return res.status(409).json({ error: 'Student is already enrolled in this schedule.' });

  const enrollment = await prisma.classEnrollment.create({ data: { studentProfileId, scheduleId } });
  return res.status(201).json({ enrollment });
}

async function listBySchedule(req, res) {
  const scheduleId = toId(req.params.scheduleId);
  if (!scheduleId) return res.status(400).json({ error: 'Invalid scheduleId.' });
  if (!(await canManage(req.user, scheduleId))) {
    return res.status(403).json({ error: 'You cannot view this schedule.' });
  }
  const enrollments = await prisma.classEnrollment.findMany({
    where: { scheduleId },
    include: { studentProfile: { select: { id: true, firstName: true, lastName: true, course: true, yearLevel: true } } },
  });
  return res.json({ enrollments });
}

async function unenroll(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const enrollment = await prisma.classEnrollment.findUnique({ where: { id } });
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found.' });
  if (!(await canManage(req.user, enrollment.scheduleId))) {
    return res.status(403).json({ error: 'You cannot manage this schedule.' });
  }
  await prisma.classEnrollment.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = { enroll, listBySchedule, unenroll };
