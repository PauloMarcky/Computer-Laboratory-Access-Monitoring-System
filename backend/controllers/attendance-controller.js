const prisma = require('../config/db');
const { toId, getStudentProfile, getInstructorProfile } = require('../utils/helpers');

async function timeIn(req, res) {
  const activeSessionId = toId(req.body?.activeSessionId);
  if (!activeSessionId) return res.status(400).json({ error: 'activeSessionId is required.' });

  const student = await getStudentProfile(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found.' });

  const session = await prisma.activeSession.findUnique({ where: { id: activeSessionId } });
  if (!session || session.status !== 'ACTIVE') {
    return res.status(400).json({ error: 'Session is not active.' });
  }

  const enrolled = await prisma.classEnrollment.findFirst({
    where: { studentProfileId: student.id, scheduleId: session.scheduleId },
  });
  if (!enrolled) return res.status(403).json({ error: 'You are not enrolled in this class.' });

  const existing = await prisma.attendanceLog.findFirst({
    where: { studentProfileId: student.id, activeSessionId },
  });
  if (existing) return res.status(409).json({ error: 'Attendance is already recorded for this session.' });

  const log = await prisma.attendanceLog.create({ data: { studentProfileId: student.id, activeSessionId } });
  return res.status(201).json({ attendance: log });
}

async function timeOut(req, res) {
  const activeSessionId = toId(req.body?.activeSessionId);
  if (!activeSessionId) return res.status(400).json({ error: 'activeSessionId is required.' });

  const student = await getStudentProfile(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found.' });

  const open = await prisma.attendanceLog.findFirst({
    where: { studentProfileId: student.id, activeSessionId, timeOut: null },
  });
  if (!open) return res.status(400).json({ error: 'You are not timed in for this session.' });

  const now = new Date();
  // Release the student's PC on time-out.
  const [log] = await prisma.$transaction([
    prisma.attendanceLog.update({ where: { id: open.id }, data: { timeOut: now } }),
    prisma.pcOccupancy.updateMany({
      where: { activeSessionId, studentProfileId: student.id, timeReleased: null },
      data: { timeReleased: now },
    }),
  ]);
  return res.json({ attendance: log });
}

async function listBySession(req, res) {
  const activeSessionId = toId(req.params.sessionId);
  if (!activeSessionId) return res.status(400).json({ error: 'Invalid sessionId.' });

  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    const session = await prisma.activeSession.findUnique({
      where: { id: activeSessionId },
      include: { schedule: true },
    });
    if (!session || !profile || session.schedule.instructorId !== profile.id) {
      return res.status(403).json({ error: 'This is not your session.' });
    }
  }

  const attendance = await prisma.attendanceLog.findMany({
    where: { activeSessionId },
    include: {
      studentProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          course: true,
          user: { select: { schoolId: true } },
        },
      },
    },
    orderBy: { timeIn: 'asc' },
  });
  return res.json({ attendance });
}

async function listMine(req, res) {
  const attendance = await prisma.attendanceLog.findMany({
    where: { studentProfile: { studentId: req.user.id } },
    include: { activeSession: { include: { schedule: true } } },
    orderBy: { timeIn: 'desc' },
  });
  return res.json({ attendance });
}

module.exports = { timeIn, timeOut, listBySession, listMine };
