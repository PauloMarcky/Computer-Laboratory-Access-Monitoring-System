const prisma = require('../config/db');
const { toId, getStudentProfile } = require('../utils/helpers');

async function claimPc(req, res) {
  const activeSessionId = toId(req.body?.activeSessionId);
  const pcNumber = String(req.body?.pcNumber ?? '').trim();
  if (!activeSessionId || !pcNumber) {
    return res.status(400).json({ error: 'activeSessionId and pcNumber are required.' });
  }

  const student = await getStudentProfile(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found.' });

  const session = await prisma.activeSession.findUnique({
    where: { id: activeSessionId },
    include: { schedule: true },
  });
  if (!session || session.status !== 'ACTIVE') return res.status(400).json({ error: 'Session is not active.' });

  const timedIn = await prisma.attendanceLog.findFirst({
    where: { studentProfileId: student.id, activeSessionId, timeOut: null },
  });
  if (!timedIn) return res.status(403).json({ error: 'Time in before claiming a PC.' });

  const mine = await prisma.pcOccupancy.findFirst({
    where: { studentProfileId: student.id, activeSessionId, timeReleased: null },
  });
  if (mine) return res.status(409).json({ error: `You already occupy PC ${mine.pcNumber}. Release it first.` });

  // A PC belongs to a lab room, so check every active session in the same room.
  const taken = await prisma.pcOccupancy.findFirst({
    where: {
      pcNumber,
      timeReleased: null,
      activeSession: { status: 'ACTIVE', schedule: { labRoomId: session.schedule.labRoomId } },
    },
  });
  if (taken) return res.status(409).json({ error: 'That PC is already occupied.' });

  const occupancy = await prisma.pcOccupancy.create({
    data: { activeSessionId, studentProfileId: student.id, pcNumber },
  });
  return res.status(201).json({ occupancy });
}

async function releasePc(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });

  const occupancy = await prisma.pcOccupancy.findUnique({ where: { id }, include: { studentProfile: true } });
  if (!occupancy) return res.status(404).json({ error: 'Record not found.' });

  const isOwner = occupancy.studentProfile.studentId === req.user.id;
  if (!isOwner && !['ADMIN', 'INSTRUCTOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'You cannot release this PC.' });
  }
  if (occupancy.timeReleased) return res.status(409).json({ error: 'PC already released.' });

  const updated = await prisma.pcOccupancy.update({ where: { id }, data: { timeReleased: new Date() } });
  return res.json({ occupancy: updated });
}

async function listBySession(req, res) {
  const activeSessionId = toId(req.params.sessionId);
  if (!activeSessionId) return res.status(400).json({ error: 'Invalid sessionId.' });
  const where = { activeSessionId };
  if (req.query.occupied === 'true') where.timeReleased = null;

  const occupancies = await prisma.pcOccupancy.findMany({
    where,
    include: { studentProfile: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { pcNumber: 'asc' },
  });
  return res.json({ occupancies });
}

module.exports = { claimPc, releasePc, listBySession };
