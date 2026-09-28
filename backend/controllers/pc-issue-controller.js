const prisma = require('../config/db');
const { toId, getStudentProfile } = require('../utils/helpers');

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const include = {
  studentProfile: { select: { id: true, firstName: true, lastName: true } },
  activeSession: { include: { schedule: { include: { labRoom: true } } } },
  handledBy: { select: { id: true, schoolId: true } },
};

async function reportIssue(req, res) {
  const activeSessionId = toId(req.body?.activeSessionId);
  const { pcNumber, issueDescription } = req.body || {};
  if (!activeSessionId || !pcNumber || typeof issueDescription !== 'string' || !issueDescription.trim()) {
    return res.status(400).json({ error: 'activeSessionId, pcNumber and issueDescription are required.' });
  }

  const student = await getStudentProfile(req.user.id);
  if (!student) return res.status(404).json({ error: 'Student profile not found.' });

  const attended = await prisma.attendanceLog.findFirst({ where: { studentProfileId: student.id, activeSessionId } });
  if (!attended) return res.status(403).json({ error: 'You did not attend this session.' });

  const report = await prisma.pcIssueReport.create({
    data: { activeSessionId, studentProfileId: student.id, pcNumber: String(pcNumber), issueDescription: issueDescription.trim() },
    include,
  });
  return res.status(201).json({ report });
}

async function listIssues(req, res) {
  const where = {};
  if (req.query.status && STATUSES.includes(String(req.query.status).toUpperCase())) {
    where.status = String(req.query.status).toUpperCase();
  }
  if (req.query.pcNumber) where.pcNumber = String(req.query.pcNumber);
  const reports = await prisma.pcIssueReport.findMany({ where, include, orderBy: { reportedAt: 'desc' } });
  return res.json({ reports });
}

async function listMyIssues(req, res) {
  const reports = await prisma.pcIssueReport.findMany({
    where: { studentProfile: { studentId: req.user.id } },
    include,
    orderBy: { reportedAt: 'desc' },
  });
  return res.json({ reports });
}

async function getIssue(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const report = await prisma.pcIssueReport.findUnique({ where: { id }, include });
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  return res.json({ report });
}

// Custodian/admin updates status and notes; the handler is recorded automatically.
async function updateIssue(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, staffNotes } = req.body || {};

  const data = { handledById: req.user.id };
  if (status !== undefined) {
    const s = String(status).toUpperCase();
    if (!STATUSES.includes(s)) return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}.` });
    data.status = s;
  }
  if (staffNotes !== undefined) data.staffNotes = staffNotes;

  const report = await prisma.pcIssueReport.update({ where: { id }, data, include });
  return res.json({ report });
}

module.exports = { reportIssue, listIssues, listMyIssues, getIssue, updateIssue };
