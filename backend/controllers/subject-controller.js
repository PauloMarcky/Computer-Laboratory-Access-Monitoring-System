const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

async function listSubjects(req, res) {
  const subjects = await prisma.subject.findMany({ orderBy: { code: 'asc' } });
  return res.json({ subjects });
}

async function createSubject(req, res) {
  const { code, title, yearLevel } = req.body || {};
  if (typeof code !== 'string' || !code.trim() || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'code and title are required.' });
  }
  try {
    const subject = await prisma.subject.create({
      data: {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        yearLevel: yearLevel != null ? Number(yearLevel) : null,
      },
    });
    return res.status(201).json({ subject });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'That subject code already exists.' });
    throw e;
  }
}

async function updateSubject(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { code, title, yearLevel } = req.body || {};
  const data = {};
  if (code !== undefined) data.code = String(code).trim().toUpperCase();
  if (title !== undefined) data.title = String(title).trim();
  if (yearLevel !== undefined) data.yearLevel = yearLevel != null ? Number(yearLevel) : null;
  const subject = await prisma.subject.update({ where: { id }, data });
  return res.json({ subject });
}

async function deleteSubject(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  await prisma.subject.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = { listSubjects, createSubject, updateSubject, deleteSubject };