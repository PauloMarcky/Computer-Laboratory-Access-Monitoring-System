function minutesOfDay(value) {
  const date = new Date(value);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function findScheduleConflict(existingSchedules, candidate) {
  const candidateStart = minutesOfDay(candidate.startTime);
  const candidateEnd = minutesOfDay(candidate.endTime);

  return existingSchedules.find((existing) => {
    if (existing.scheduleId === candidate.scheduleId) return false;
    if (existing.dayOfWeek !== candidate.dayOfWeek || existing.termId !== candidate.termId) return false;

    const overlaps = candidateStart < minutesOfDay(existing.endTime)
      && candidateEnd > minutesOfDay(existing.startTime);
    if (!overlaps) return false;

    return existing.labRoomId === candidate.labRoomId
      || existing.instructorId === candidate.instructorId;
  }) || null;
}

function getScheduleConflictMessage(existing, candidate) {
  if (existing.labRoomId === candidate.labRoomId) {
    return 'This lab room is already booked for that time in this term.';
  }
  return 'This instructor is already scheduled for that time in this term.';
}

module.exports = { findScheduleConflict, getScheduleConflictMessage };
