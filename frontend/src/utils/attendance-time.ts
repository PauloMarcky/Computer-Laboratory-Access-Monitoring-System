import type { AttendanceEntry } from '../types';

function timeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

export function getAttendanceStatus(
  now: Date,
  classStartTime: string,
  classEndTime: string,
): AttendanceEntry['status'] {
  const start = timeToMinutes(classStartTime);
  const end = timeToMinutes(classEndTime);
  if (start === null || end === null || end <= start) return 'On-Time';

  const lateAfter = start + (end - start) * 0.25;
  const currentTime = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  return currentTime >= lateAfter ? 'Late' : 'On-Time';
}

export function formatAttendanceTime(time: Date): string {
  return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
