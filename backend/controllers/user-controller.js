const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

const creatableRoles = new Set(['STUDENT', 'INSTRUCTOR', 'CUSTODIAN']);

function toPublicUser(user) {
  const profile = user.role === 'STUDENT'
    ? user.studentProfile
    : user.role === 'INSTRUCTOR'
      ? user.instructorProfile
      : user.role === 'CUSTODIAN'  // ← ADD THIS
        ? user.custodianProfile
        : null;
  return {
    id: user.id,
    schoolId: user.schoolId,
    role: user.role,
    fullName: profile ? `${profile.firstName} ${profile.lastName}` : null,
    createdAt: user.createdAt,
  };
}


async function login(req, res) {
  const { schoolId, password } = req.body || {};

  if (typeof schoolId !== 'string' || !schoolId.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'schoolId and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { schoolId: schoolId.trim() } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const hasBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
  const isPasswordValid = hasBcryptHash
    ? await bcrypt.compare(password, user.password)
    : password === user.password;
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Authentication is not configured.' });
  }

  if (!hasBcryptHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12) },
    });
  }

  const token = jwt.sign({}, secret, {
    subject: String(user.id),
    issuer: 'clams-api',
    audience: 'clams-client',
    expiresIn: '8h',
  });

  return res.json({
    token,
    user: {
      id: user.id,
      schoolId: user.schoolId,
      role: user.role,
    },
  });
}

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: {
      id: true,
      schoolId: true,
      role: true,
      createdAt: true,
      studentProfile: { select: { firstName: true, lastName: true } },
      instructorProfile: { select: { firstName: true, lastName: true } },
      custodianProfile: { select: { firstName: true, lastName: true } }, // ← ADD THIS
    },
    orderBy: { id: 'asc' },
  });
  return res.json({ users: users.map(toPublicUser) });
}


async function createUser(req, res) {
  const { schoolId, password, role, firstName, lastName, course, yearLevel, department } = req.body || {};
  if (typeof schoolId !== 'string' || !schoolId.trim() || typeof password !== 'string') {
    return res.status(400).json({ error: 'schoolId and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (!creatableRoles.has(role)) {
    return res.status(400).json({ error: 'Only student, instructor, and custodian accounts can be created.' });
  }
  if ([firstName, lastName].some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ error: 'firstName and lastName are required.' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    let user;
    if (role === 'STUDENT') {
      const profile = await prisma.studentProfile.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          course: typeof course === 'string' && course.trim() ? course.trim() : null,
          yearLevel: yearLevel ? Number(yearLevel) : null,
          user: {
            create: { schoolId: schoolId.trim(), password: hashedPassword, role },
          },
        },
        include: { user: { select: { id: true, schoolId: true, role: true, createdAt: true } } },
      });
      user = { ...profile.user, studentProfile: profile };
    } else if (role === 'INSTRUCTOR') {
      const profile = await prisma.instructorProfile.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          department: typeof department === 'string' && department.trim() ? department.trim() : null,
          user: {
            create: { schoolId: schoolId.trim(), password: hashedPassword, role },
          },
        },
        include: { user: { select: { id: true, schoolId: true, role: true, createdAt: true } } },
      });
      user = { ...profile.user, instructorProfile: profile };
    } else if (role === 'CUSTODIAN') { // ← ADD THIS BLOCK
      const profile = await prisma.custodianProfile.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          user: {
            create: { schoolId: schoolId.trim(), password: hashedPassword, role },
          },
        },
        include: { user: { select: { id: true, schoolId: true, role: true, createdAt: true } } },
      });
      user = { ...profile.user, custodianProfile: profile };
    } else {
      user = await prisma.user.create({
        data: { schoolId: schoolId.trim(), password: hashedPassword, role },
        select: { id: true, schoolId: true, role: true, createdAt: true },
      });
    }
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this school ID already exists.' });
    }
    throw error;
  }
}

async function updatePassword(req, res) {
  const id = toId(req.params.id);
  const { newPassword } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Invalid user ID.' });
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, 12) },
    });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'User not found.' });
    throw error;
  }
  return res.json({ message: 'Password updated.' });
}

module.exports = { login, listUsers, createUser, updatePassword };
