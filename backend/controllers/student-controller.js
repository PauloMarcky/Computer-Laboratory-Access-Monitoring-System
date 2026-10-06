const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { toId } = require('../utils/helpers');
const { normalizeStudentYearLevel } = require('../utils/student-import');

const include = { user: { select: { id: true, schoolId: true, role: true } } };

// Creates a User (role STUDENT) and its StudentProfile together.
async function createStudent(req, res) {
  const { schoolId, password, firstName, lastName, course, yearLevel } = req.body || {};
  if (![schoolId, password, firstName, lastName].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'schoolId, password, firstName and lastName are required.' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const normalizedYearLevel = normalizeStudentYearLevel(yearLevel);
  if (normalizedYearLevel === null) {
    return res.status(400).json({ error: 'yearLevel is required and must be between 1 and 4 for student accounts.' });
  }

  const student = await prisma.studentProfile.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      course: course || null,
      yearLevel: normalizedYearLevel,
      user: {
        create: { schoolId: schoolId.trim(), password: await bcrypt.hash(password, 12), role: 'STUDENT' },
      },
    },
    include,
  });
  return res.status(201).json({ student });
}

async function listStudents(req, res) {
  const students = await prisma.studentProfile.findMany({ include, orderBy: { lastName: 'asc' } });
  return res.json({ students });
}

async function getStudent(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const student = await prisma.studentProfile.findUnique({ where: { id }, include });
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  return res.json({ student });
}

async function getMyStudentProfile(req, res) {
  const student = await prisma.studentProfile.findUnique({ where: { studentId: req.user.id }, include });
  if (!student) return res.status(404).json({ error: 'Student profile not found.' });
  return res.json({ student });
}

async function updateStudent(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { firstName, lastName, course, yearLevel } = req.body || {};
  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (course !== undefined) data.course = course;
  if (yearLevel !== undefined) data.yearLevel = yearLevel === null ? null : Number(yearLevel);
  const student = await prisma.studentProfile.update({ where: { id }, data, include });
  return res.json({ student });
}

// Deleting the User cascades to the profile.
async function deleteStudent(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const profile = await prisma.studentProfile.findUnique({ where: { id } });
  if (!profile) return res.status(404).json({ error: 'Student not found.' });
  await prisma.user.delete({ where: { id: profile.studentId } });
  return res.status(204).send();
}

module.exports = { createStudent, listStudents, getStudent, getMyStudentProfile, updateStudent, deleteStudent };
