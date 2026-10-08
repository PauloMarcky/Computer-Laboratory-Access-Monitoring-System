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

// GET /api/lab-rooms/status
// Live status of every lab room: available/in-use, current class, PC counts.
async function getLabRoomStatus(req, res) {
  const [rooms, activeSessions] = await Promise.all([
    prisma.labRoom.findMany({ orderBy: { roomName: 'asc' } }),
    prisma.activeSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        schedule: {
          include: {
            instructor: { select: { firstName: true, lastName: true } },
          },
        },
        pcOccupancies: {
          where: { timeReleased: null },
          select: { id: true },
        },
      },
    }),
  ]);

  // Index active sessions by labRoomId
  const sessionByRoomId = new Map();
  for (const s of activeSessions) {
    sessionByRoomId.set(s.schedule.labRoomId, s);
  }

  const formatTime = (date) => {
    const d = new Date(date);
    const hour = d.getUTCHours();
    const minute = String(d.getUTCMinutes()).padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${period}`;
  };

  const result = rooms.map((room) => {
    const session = sessionByRoomId.get(room.id);
    const totalPcs = room.capacity ?? 0;
    const occupiedPcs = session ? session.pcOccupancies.length : 0;

    return {
      id: String(room.id),
      name: room.roomName,
      location: room.description ?? '',
      status: session ? 'IN USE' : 'AVAILABLE',
      subject: session?.schedule.subjectCode ?? undefined,
      instructor: session
        ? `${session.schedule.instructor.firstName} ${session.schedule.instructor.lastName}`
        : undefined,
      section: session?.schedule.section ?? undefined,
      timeslot: session
        ? `${formatTime(session.schedule.startTime)} - ${formatTime(session.schedule.endTime)}`
        : undefined,
      availablePcs: Math.max(0, totalPcs - occupiedPcs),
      occupiedPcs,
      totalPcs,
    };
  });

  return res.json({ rooms: result });
}

module.exports = {
  createLabRoom,
  listLabRooms,
  getLabRoom,
  updateLabRoom,
  deleteLabRoom,
  getLabRoomStatus,
};