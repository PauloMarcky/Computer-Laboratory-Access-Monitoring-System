function minutesOfDay(value) {
  const date = new Date(value);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = DAYS.length * MINUTES_PER_DAY;

function findScheduleConflict(existingSchedules, candidate) {
  const candidateDay = DAYS.indexOf(candidate.dayOfWeek);
  if (candidateDay < 0) return null;

  const candidateStart = candidateDay * MINUTES_PER_DAY + minutesOfDay(candidate.startTime);
  const candidateStartClock = minutesOfDay(candidate.startTime);
  const candidateEndClock = minutesOfDay(candidate.endTime);
  const candidateDuration = (candidateEndClock - candidateStartClock + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const candidateEnd = candidateStart + candidateDuration;

  return existingSchedules.find((existing) => {
    if (existing.scheduleId === candidate.scheduleId) return false;
    if (existing.termId !== candidate.termId) return false;
    const existingDay = DAYS.indexOf(existing.dayOfWeek);
    if (existingDay < 0) return false;

    const existingStart = existingDay * MINUTES_PER_DAY + minutesOfDay(existing.startTime);
    const existingStartClock = minutesOfDay(existing.startTime);
    const existingEndClock = minutesOfDay(existing.endTime);
    const existingDuration = (existingEndClock - existingStartClock + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const existingEnd = existingStart + existingDuration;
    const overlaps = [-MINUTES_PER_WEEK, 0, MINUTES_PER_WEEK].some((weekOffset) => (
      candidateStart < existingEnd + weekOffset
      && candidateEnd > existingStart + weekOffset
    ));
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
