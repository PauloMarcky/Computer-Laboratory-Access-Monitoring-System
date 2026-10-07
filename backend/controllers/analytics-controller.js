const prisma = require('../config/db');

// "Juan Dela Cruz" → "J*** D***"
function maskName(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const fi = f ? `${f[0]}***` : '***';
  const li = l ? `${l[0]}***` : '***';
  return `${fi} ${li}`;
}

// GET /api/analytics/overview
async function getOverview(req, res) {
  // Which term are we analyzing? Default to the active one.
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } });

  // Global KPIs
  const totalRegistered = await prisma.studentProfile.count();

  // Sessions we count: any session that hasn't been cancelled.
  // (If you want to exclude in-progress classes too, change to: status: 'ENDED'.)
  const sessionFilter = {
    status: { not: 'CANCELLED' },
    ...(activeTerm ? { schedule: { termId: activeTerm.id } } : {}),
  };

  const sessions = await prisma.activeSession.findMany({
    where: sessionFilter,
    include: {
      schedule: {
        include: {
          classEnrollments: { select: { id: true } },
        },
      },
      attendanceLogs: { select: { id: true } },
    },
  });

  // Aggregate per session → per subject, per month
  let totalExpected = 0;
  let totalAttended = 0;
  const subjectAbsenceMap = new Map(); // code → absences
  const monthlyMap = new Map();        // "YYYY-MM" → { expected, attended }

  for (const s of sessions) {
    const expected = s.schedule.classEnrollments.length;
    const attended = s.attendanceLogs.length;
    const absences = Math.max(0, expected - attended);

    totalExpected += expected;
    totalAttended += attended;

    const code = s.schedule.subjectCode || 'UNKNOWN';
    subjectAbsenceMap.set(code, (subjectAbsenceMap.get(code) || 0) + absences);

    const month = new Date(s.sessionDate).toISOString().slice(0, 7);
    const bucket = monthlyMap.get(month) || { expected: 0, attended: 0 };
    bucket.expected += expected;
    bucket.attended += attended;
    monthlyMap.set(month, bucket);
  }

  const avgAttendanceRate = totalExpected > 0
    ? Math.round((totalAttended / totalExpected) * 1000) / 10
    : 0;
  const totalAbsences = Math.max(0, totalExpected - totalAttended);

  // Per-student roll-up (for At Risk + Top Absent)
  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { schoolId: true } },
      classEnrollments: {
        include: {
          schedule: {
            include: {
              activeSessions: {
                where: { status: { not: 'CANCELLED' } },
                select: { id: true },
              },
            },
          },
        },
      },
      attendanceLogs: { select: { id: true } },
    },
  });

  const studentStats = students
    .map((s) => {
      let expected = 0;
      for (const e of s.classEnrollments) {
        expected += e.schedule.activeSessions.length;
      }
      const attended = s.attendanceLogs.length;
      const absences = Math.max(0, expected - attended);
      const rate = expected > 0 ? absences / expected : 0;

      return {
        studentProfileId: s.id,
        schoolId: s.user.schoolId,
        fullName: `${s.firstName} ${s.lastName}`.trim(),
        masked: maskName(s.firstName, s.lastName),
        course: s.course || 'BSIT',
        yearLevel: s.yearLevel ?? null,
        absences,
        expected,
        attended,
        rate,
        severity: rate >= 0.25 ? 'critical' : 'warning',
      };
    })
    .filter((s) => s.absences > 0)
    .sort((a, b) => b.absences - a.absences);

  const studentsAtRisk = studentStats.filter((s) => s.rate >= 0.25).length;
  const topAbsentStudents = studentStats.slice(0, 10);

  return res.json({
    term: activeTerm
      ? {
        id: activeTerm.id,
        academicYear: activeTerm.academicYear,
        semester: activeTerm.semester,
      }
      : null,
    kpis: {
      totalRegistered,
      avgAttendanceRate,
      totalAbsences,
      studentsAtRisk,
    },
    monthlyAbsenceRate: Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, m]) => ({
        month,
        rate: m.expected > 0
          ? Math.round(((m.expected - m.attended) / m.expected) * 1000) / 10
          : 0,
        expected: m.expected,
        attended: m.attended,
      })),
    subjectAbsences: Array.from(subjectAbsenceMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
    topAbsentStudents,
  });
}

module.exports = { getOverview };