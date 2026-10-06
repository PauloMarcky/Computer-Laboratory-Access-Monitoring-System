// Schedule time helpers.
//
// Schedule.startTime / endTime are stored by parseTime() as "1970-01-01THH:MM:00Z",
// i.e. the wall-clock time is kept in the UTC fields. So we compare wall-clock
// minutes-of-day, and we read "now" in Asia/Manila (the server clock may be UTC).

const TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Manila';
const EARLY_GRACE_MIN = Number(process.env.SCHEDULE_EARLY_GRACE_MIN ?? 15);
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function nowInSchoolTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  const hour = Number(get('hour')) % 24; // some engines return "24" at midnight
  return {
    day: get('weekday').toUpperCase(), // "MONDAY"
    minutes: hour * 60 + Number(get('minute')),
  };
}

function schoolTimeMinutes(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return (Number(get('hour')) % 24) * 60 + Number(get('minute'));
}

const minutesOfDay = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();

function getAttendanceStatus(timeIn, schedule) {
  const start = minutesOfDay(new Date(schedule.startTime));
  const end = minutesOfDay(new Date(schedule.endTime));
  const current = schoolTimeMinutes(new Date(timeIn));
  if (end > start) {
    const lateAfter = start + (end - start) * 0.25;
    return current >= lateAfter ? 'Late' : 'On-Time';
  }

  const duration = 24 * 60 - start + end;
  const elapsed = current >= start
    ? current - start
    : current < end ? 24 * 60 - start + current : -1;
  return elapsed >= duration * 0.25 ? 'Late' : 'On-Time';
}

function formatSchoolDate(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function formatSchoolTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// True when the schedule is for today and the current time is inside
// [start - early grace, end).
function isScheduleOpenNow(schedule, date = new Date()) {
  const { day, minutes } = nowInSchoolTime(date);
  const scheduleDay = String(schedule.dayOfWeek).toUpperCase();
  const dayIndex = DAYS.indexOf(scheduleDay);
  if (dayIndex < 0) return false;
  const start = minutesOfDay(new Date(schedule.startTime));
  const end = minutesOfDay(new Date(schedule.endTime));
  if (day === scheduleDay) {
    return minutes >= start - EARLY_GRACE_MIN && (end <= start || minutes < end);
  }

  const nextDay = DAYS[(dayIndex + 1) % DAYS.length];
  return end < start && day === nextDay && minutes < end;
}

module.exports = {
  nowInSchoolTime,
  isScheduleOpenNow,
  getAttendanceStatus,
  formatSchoolDate,
  formatSchoolTime,
};