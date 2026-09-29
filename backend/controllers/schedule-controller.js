const prisma = require('../config/db');
const { toId, parseTime, getInstructorProfile, DAYS } = require('../utils/helpers');

const include = {
  labRoom: true,
  instructor: { select: { id: true, firstName: true, lastName: true } },
};

async function createSchedule(req, res) {
  const { instructorId, labRoomId, subjectCode, dayOfWeek, startTime, endTime, semester } = req.body || {};
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (!toId(instructorId) || !toId(labRoomId) || typeof subjectCode !== 'string' || !subjectCode.trim()) {
    return res.status(400).json({ error: 'instructorId, labRoomId and subjectCode are required.' });
  }
  if (!DAYS.includes(String(dayOfWeek).toUpperCase())) {
    return res.status(400).json({ error: `dayOfWeek must be one of ${DAYS.join(', ')}.` });
  }
  if (!start || !end || end <= start) {
    return res.status(400).json({ error: 'Valid startTime and endTime (HH:MM) are required; end must be after start.' });
  }

  const day = String(dayOfWeek).toUpperCase();

  // Prevent overlapping bookings in the same room on the same day.
  const sameDay = await prisma.schedule.findMany({ where: { labRoomId: Number(labRoomId), dayOfWeek: day } });
  const toMin = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();
  const conflict = sameDay.find((s) => toMin(start) < toMin(s.endTime) && toMin(end) > toMin(s.startTime));
  if (conflict) return res.status(409).json({ error: 'This lab room is already booked for that time.' });

  const schedule = await prisma.schedule.create({
    data: {
      instructorId: Number(instructorId),
      labRoomId: Number(labRoomId),
      subjectCode: subjectCode.trim(),
      dayOfWeek: day,
      startTime: start,
      endTime: end,
      semester: typeof semester === 'string' && semester.trim() ? semester.trim() : null,
    },
    include,
  });
  return res.status(201).json({ schedule });
}

async function listSchedules(req, res) {
  const where = {};
  if (req.query.labRoomId) where.labRoomId = toId(req.query.labRoomId) || -1;
  if (req.query.dayOfWeek) where.dayOfWeek = String(req.query.dayOfWeek).toUpperCase();

  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    where.instructorId = profile ? profile.id : -1;
  } else if (req.query.instructorId) {
    where.instructorId = toId(req.query.instructorId) || -1;
  }

  const schedules = await prisma.schedule.findMany({ where, include, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
  return res.json({ schedules });
}

// Schedules a student is enrolled in.
async function listMySchedules(req, res) {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentProfile: { studentId: req.user.id } },
    include: { schedule: { include } },
  });
  return res.json({ schedules: enrollments.map((e) => e.schedule) });
}

async function getSchedule(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const schedule = await prisma.schedule.findUnique({ where: { id }, include });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });
  return res.json({ schedule });
}

async function updateSchedule(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { instructorId, labRoomId, subjectCode, dayOfWeek, startTime, endTime, semester } = req.body || {};
  const data = {};
  if (instructorId !== undefined) data.instructorId = Number(instructorId);
  if (labRoomId !== undefined) data.labRoomId = Number(labRoomId);
  if (subjectCode !== undefined) data.subjectCode = subjectCode;
  if (dayOfWeek !== undefined) {
    if (!DAYS.includes(String(dayOfWeek).toUpperCase())) return res.status(400).json({ error: 'Invalid dayOfWeek.' });
    data.dayOfWeek = String(dayOfWeek).toUpperCase();
  }
  if (startTime !== undefined) {
    data.startTime = parseTime(startTime);
    if (!data.startTime) return res.status(400).json({ error: 'Invalid startTime.' });
  }
  if (endTime !== undefined) {
    data.endTime = parseTime(endTime);
    if (!data.endTime) return res.status(400).json({ error: 'Invalid endTime.' });
  }
  if (semester !== undefined) {
    data.semester = typeof semester === 'string' && semester.trim() ? semester.trim() : null;
  }
  const schedule = await prisma.schedule.update({ where: { id }, data, include });
  return res.json({ schedule });
}

async function deleteSchedule(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  await prisma.schedule.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = { createSchedule, listSchedules, listMySchedules, getSchedule, updateSchedule, deleteSchedule };
