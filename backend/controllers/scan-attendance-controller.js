const prisma = require('../config/db');
const { scanImage } = require('../services/scanner-service');
const { toId, getInstructorProfile } = require('../utils/helpers');
const { isScheduleOpenNow } = require('../utils/schedule-match');

// POST /api/attendance/scan-image?scheduleId=<id>
// Body: image/jpeg (one cropped camera frame)
//
// The camera only ever gets an accepted student back when ALL of these are true:
//   1. the schedule belongs to the logged-in instructor (admins are allowed too)
//   2. the schedule is happening right now (its day + time window)
//   3. the ID read by OCR belongs to a student
//   4. that student is enrolled in THIS schedule (subject/section roster)
async function scanImageForSchedule(req, res) {
  const scheduleId = toId(req.query.scheduleId);
  const activeSessionId = toId(req.query.sessionId);
  if (!scheduleId || !activeSessionId) {
    return res.status(400).json({ error: 'scheduleId and sessionId are required.' });
  }

  const schedule = await prisma.schedule.findUnique({ where: { scheduleId } });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

  const activeSession = await prisma.activeSession.findUnique({ where: { id: activeSessionId } });
  if (!activeSession || activeSession.status !== 'ACTIVE' || activeSession.scheduleId !== scheduleId) {
    return res.status(409).json({ error: 'The active session does not match this schedule.' });
  }

  // 1. ownership
  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    if (!profile || profile.id !== schedule.instructorId) {
      return res.status(403).json({ error: 'This is not your schedule.' });
    }
  }

  // 2. schedule must be open right now (checked on the server, not just the browser)
  if (!isScheduleOpenNow(schedule)) {
    return res.json({ detected: false, matched: false, reason: 'OUTSIDE_SCHEDULE' });
  }

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'A JPEG image body is required.' });
  }

  // OCR (Python worker)
  let result;
  try {
    result = await scanImage(req.body);
  } catch (e) {
    return res.status(503).json({ error: e.message || 'OCR worker unavailable.' });
  }
  if (result.error) return res.status(503).json({ error: result.error });
  if (!result.scannedId) return res.json({ detected: false, matched: false });

  const scannedId = String(result.scannedId).trim();

  // 3. ID -> student
  const user = await prisma.user.findUnique({
    where: { schoolId: scannedId },
    include: { studentProfile: true },
  });
  const student = user?.studentProfile;
  if (!user || user.role !== 'STUDENT' || !student) {
    return res.json({ detected: true, matched: false, scannedId, reason: 'UNKNOWN_ID' });
  }

  const studentName = `${student.firstName} ${student.lastName}`;
  const formalName = `${student.lastName}, ${student.firstName}`;

  // 4. must be on this schedule's roster
  const enrolled = await prisma.classEnrollment.findFirst({
    where: { studentProfileId: student.id, scheduleId },
    select: { id: true },
  });
  if (!enrolled) {
    return res.json({
      detected: true,
      matched: false,
      scannedId,
      reason: 'NOT_ENROLLED',
      studentId: scannedId,
      studentName,
    });
  }

  const existingAttendance = await prisma.attendanceLog.findFirst({
    where: { studentProfileId: student.id, activeSessionId },
    orderBy: { timeIn: 'asc' },
  });
  const attendance = existingAttendance || await prisma.attendanceLog.create({
    data: { studentProfileId: student.id, activeSessionId },
  });

  return res.json({
    detected: true,
    matched: true,
    alreadyLogged: Boolean(existingAttendance),
    attendanceId: attendance.id,
    scannedId,
    studentId: scannedId,
    studentName,
    formalName,
    course: student.course || '',
    yearLevel: student.yearLevel != null ? String(student.yearLevel) : '',
    timeIn: attendance.timeIn.toISOString(),
  });
}

async function manualTimeIn(req, res) {
  const activeSessionId = toId(req.body?.activeSessionId);
  const schoolId = String(req.body?.schoolId ?? '').trim();
  if (!activeSessionId || !schoolId) {
    return res.status(400).json({ error: 'activeSessionId and schoolId are required.' });
  }

  const session = await prisma.activeSession.findUnique({
    where: { id: activeSessionId },
    include: { schedule: true },
  });
  if (!session || session.status !== 'ACTIVE') {
    return res.status(409).json({ error: 'Session is not active.' });
  }
  if (req.user.role === 'INSTRUCTOR') {
    const profile = await getInstructorProfile(req.user.id);
    if (!profile || profile.id !== session.schedule.instructorId) {
      return res.status(403).json({ error: 'This is not your session.' });
    }
  }
  if (!isScheduleOpenNow(session.schedule)) {
    return res.status(409).json({ error: 'This class is outside its scheduled time.' });
  }

  const user = await prisma.user.findUnique({
    where: { schoolId },
    include: { studentProfile: true },
  });
  if (!user || user.role !== 'STUDENT' || !user.studentProfile) {
    return res.status(404).json({ error: 'Student ID was not found.' });
  }
  const enrolled = await prisma.classEnrollment.findFirst({
    where: { studentProfileId: user.studentProfile.id, scheduleId: session.scheduleId },
  });
  if (!enrolled) return res.status(403).json({ error: 'Student is not enrolled in this class.' });

  const existingAttendance = await prisma.attendanceLog.findFirst({
    where: { studentProfileId: user.studentProfile.id, activeSessionId },
    orderBy: { timeIn: 'asc' },
  });
  const attendance = existingAttendance || await prisma.attendanceLog.create({
    data: { studentProfileId: user.studentProfile.id, activeSessionId },
  });
  const student = user.studentProfile;

  return res.status(existingAttendance ? 200 : 201).json({
    alreadyLogged: Boolean(existingAttendance),
    attendanceId: attendance.id,
    studentId: user.schoolId,
    studentName: `${student.firstName} ${student.lastName}`,
    formalName: `${student.lastName}, ${student.firstName}`,
    course: student.course || '',
    yearLevel: student.yearLevel != null ? String(student.yearLevel) : '',
    timeIn: attendance.timeIn.toISOString(),
  });
}

module.exports = { scanImageForSchedule, manualTimeIn };