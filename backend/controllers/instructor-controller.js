const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

const include = { user: { select: { id: true, schoolId: true, role: true } } };

async function createInstructor(req, res) {
  const { schoolId, password, firstName, lastName, department } = req.body || {};
  if (![schoolId, password, firstName, lastName].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'schoolId, password, firstName and lastName are required.' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const instructor = await prisma.instructorProfile.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      department: department || null,
      user: {
        create: { schoolId: schoolId.trim(), password: await bcrypt.hash(password, 12), role: 'INSTRUCTOR' },
      },
    },
    include,
  });
  return res.status(201).json({ instructor });
}

async function listInstructors(req, res) {
  const instructors = await prisma.instructorProfile.findMany({ include, orderBy: { lastName: 'asc' } });
  return res.json({ instructors });
}

async function getInstructor(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const instructor = await prisma.instructorProfile.findUnique({ where: { id }, include });
  if (!instructor) return res.status(404).json({ error: 'Instructor not found.' });
  return res.json({ instructor });
}

async function getMyInstructorProfile(req, res) {
  const instructor = await prisma.instructorProfile.findUnique({ where: { instructorId: req.user.id }, include });
  if (!instructor) return res.status(404).json({ error: 'Instructor profile not found.' });
  return res.json({ instructor });
}

async function updateInstructor(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { firstName, lastName, department } = req.body || {};
  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (department !== undefined) data.department = department;
  const instructor = await prisma.instructorProfile.update({ where: { id }, data, include });
  return res.json({ instructor });
}

async function deleteInstructor(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const profile = await prisma.instructorProfile.findUnique({ where: { id } });
  if (!profile) return res.status(404).json({ error: 'Instructor not found.' });
  await prisma.user.delete({ where: { id: profile.instructorId } });
  return res.status(204).send();
}

module.exports = { createInstructor, listInstructors, getInstructor, getMyInstructorProfile, updateInstructor, deleteInstructor };
