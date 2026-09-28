const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const roles = new Set(['ADMIN', 'INSTRUCTOR', 'CUSTODIAN', 'STUDENT']);

const publicUserFields = {
  id: true,
  schoolId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

async function login(req, res) {

  const { schoolId, password } = req.body;

  if (!schoolId || !password) {
    return res.status(400).json({ message: 'Email and Password is required' })
  }

  const user = await prisma.user.findFirst({ where: { schoolId } })

  if (!user) {
    return res.status(401).json({ message: 'Invalid Credentials' })
  }

  const isPasswordValid = await bcrypt.compare(password, prisma.user.password)

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid Credentials' })
  }

  const token = jwt.sign(
    {
      id: user.id
    }
  )

}

async function createUser(req, res) {
  const { schoolId, password, role = 'STUDENT' } = req.body || {};

  if (typeof schoolId !== 'string' || !schoolId.trim() || typeof password !== 'string') {
    return res.status(400).json({ error: 'schoolId and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (!roles.has(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        schoolId: schoolId.trim(),
        password: await bcrypt.hash(password, 12),
        role,
      },
      select: publicUserFields,
    });
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this schoolId already exists.' });
    }
    throw error;
  }
}

async function deleteUser(req, res) {

}

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: publicUserFields,
    orderBy: { id: 'asc' },
  });
  return res.json({ users });
}

module.exports = { login, createUser, listUsers, deleteUser };
