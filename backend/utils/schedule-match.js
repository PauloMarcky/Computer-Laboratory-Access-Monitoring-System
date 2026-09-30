// Schedule time helpers.
//
// Schedule.startTime / endTime are stored by parseTime() as "1970-01-01THH:MM:00Z",
// i.e. the wall-clock time is kept in the UTC fields. So we compare wall-clock
// minutes-of-day, and we read "now" in Asia/Manila (the server clock may be UTC).

const TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Manila';
const EARLY_GRACE_MIN = Number(process.env.SCHEDULE_EARLY_GRACE_MIN ?? 15);

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

const minutesOfDay = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();

// True when the schedule is for today and the current time is inside
// [start - early grace, end).
function isScheduleOpenNow(schedule, date = new Date()) {
  const { day, minutes } = nowInSchoolTime(date);
  if (String(schedule.dayOfWeek).toUpperCase() !== day) return false;
  const start = minutesOfDay(new Date(schedule.startTime));
  const end = minutesOfDay(new Date(schedule.endTime));
  return minutes >= start - EARLY_GRACE_MIN && minutes < end;
}

module.exports = { nowInSchoolTime, isScheduleOpenNow };