const prisma = require('../config/db');
const { toId } = require('../utils/helpers');

async function createLabRoom(req, res) {
  const { roomName, capacity, description } = req.body || {};
  if (typeof roomName !== 'string' || !roomName.trim()) {
    return res.status(400).json({ error: 'roomName is required.' });
  }
  const labRoom = await prisma.labRoom.create({
    data: { roomName: roomName.trim(), capacity: capacity ? Number(capacity) : null, description: description || null },
  });
  return res.status(201).json({ labRoom });
}

async function listLabRooms(req, res) {
  const labRooms = await prisma.labRoom.findMany({ orderBy: { roomName: 'asc' } });
  return res.json({ labRooms });
}

async function getLabRoom(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const labRoom = await prisma.labRoom.findUnique({ where: { id } });
  if (!labRoom) return res.status(404).json({ error: 'Lab room not found.' });
  return res.json({ labRoom });
}

async function updateLabRoom(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { roomName, capacity, description } = req.body || {};
  const data = {};
  if (roomName !== undefined) data.roomName = roomName;
  if (capacity !== undefined) data.capacity = capacity === null ? null : Number(capacity);
  if (description !== undefined) data.description = description;
  const labRoom = await prisma.labRoom.update({ where: { id }, data });
  return res.json({ labRoom });
}

async function deleteLabRoom(req, res) {
  const id = toId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  await prisma.labRoom.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = { createLabRoom, listLabRooms, getLabRoom, updateLabRoom, deleteLabRoom };
