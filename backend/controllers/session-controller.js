const prisma = require('../config/db');
const { toId, getInstructorProfile } = require('../utils/helpers');

const include = {
  schedule: { include: { labRoom: true } },
};

async function startSession(req, res) {
  const scheduleId = toId(req.body?.scheduleId);
  if (!scheduleId) return res.status(400).json({ error: 'scheduleId is required.' });

  const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    if (!profile || profile.id !== schedule.instructorId) {
      return res.status(403).json({ error: 'This is not your schedule.' });
    }
  }

  // One active session per schedule, and one per lab room.
  const running = await prisma.activeSession.findFirst({
    where: { status: 'ACTIVE', schedule: { OR: [{ id: scheduleId }, { labRoomId: schedule.labRoomId }] } },
  });
  if (running) return res.status(409).json({ error: 'A session is already active for this schedule or lab room.' });

  const session = await prisma.activeSession.create({ data: { scheduleId }, include });
  return res.status(201).json({ session });
}

async function endSession(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });

  const session = await prisma.activeSession.findUnique({ where: { id }, include });
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  if (session.status !== 'ACTIVE') return res.status(409).json({ error: 'Session already ended.' });

  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    if (!profile || profile.id !== session.schedule.instructorId) {
      return res.status(403).json({ error: 'This is not your session.' });
    }
  }

  const now = new Date();
  const [ended] = await prisma.$transaction([
    prisma.activeSession.update({ where: { id }, data: { status: 'ENDED', endTime: now }, include }),
    // Close any open attendance and PC claims.
    prisma.attendanceLog.updateMany({ where: { activeSessionId: id, timeOut: null }, data: { timeOut: now } }),
    prisma.pcOccupancy.updateMany({ where: { activeSessionId: id, timeReleased: null }, data: { timeReleased: now } }),
  ]);
  return res.json({ session: ended });
}

async function listSessions(req, res) {
  const where = {};
  if (req.query.status) where.status = String(req.query.status).toUpperCase();
  if (req.query.scheduleId) where.scheduleId = toId(req.query.scheduleId) || -1;

  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    where.schedule = { instructorId: profile ? profile.id : -1 };
  }
  const sessions = await prisma.activeSession.findMany({ where, include, orderBy: { startTime: 'desc' } });
  return res.json({ sessions });
}

// Active sessions for classes the student is enrolled in.
async function listMyActiveSessions(req, res) {
  const sessions = await prisma.activeSession.findMany({
    where: {
      status: 'ACTIVE',
      schedule: { classEnrollments: { some: { studentProfile: { studentId: req.user.id } } } },
    },
    include,
  });
  return res.json({ sessions });
}

async function getSession(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const session = await prisma.activeSession.findUnique({ where: { id }, include });
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  return res.json({ session });
}

module.exports = { startSession, endSession, listSessions, listMyActiveSessions, getSession };
