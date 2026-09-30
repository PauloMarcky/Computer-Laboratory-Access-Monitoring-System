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
  if (!scheduleId) return res.status(400).json({ error: 'scheduleId is required.' });

  const schedule = await prisma.schedule.findUnique({ where: { scheduleId } });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

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

  return res.json({
    detected: true,
    matched: true,
    scannedId,
    studentId: scannedId,
    studentName,
    formalName,
    course: student.course || '',
    yearLevel: student.yearLevel != null ? String(student.yearLevel) : '',
    timeIn: new Date().toISOString(),
  });
}

module.exports = { scanImageForSchedule };