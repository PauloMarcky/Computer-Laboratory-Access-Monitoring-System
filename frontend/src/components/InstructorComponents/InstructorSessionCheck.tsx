import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpenCheck, CalendarClock, CircleAlert } from 'lucide-react';
import { ClamsHeader } from '../ClamsHeader';
import type { ScheduleEntry, WireframeScreenId } from '../../types';

interface InstructorSessionCheckProps {
  schedules: ScheduleEntry[];
  onStartAttendance: (schedule: ScheduleEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

const toMinutes = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hourText, minuteText, period] = match;
  let hour = Number(hourText) % 12;
  if (period.toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(minuteText);
};

export const InstructorSessionCheck = ({ schedules, onStartAttendance, onNavigate }: InstructorSessionCheckProps) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [matchedSchedule, setMatchedSchedule] = useState<ScheduleEntry | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId) || null;
  const currentTimeLabel = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const clearResult = () => {
    setMatchedSchedule(null);
    setHasChecked(false);
  };

  const handleCheck = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date();
    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const start = selectedSchedule ? toMinutes(selectedSchedule.startTime) : null;
    const end = selectedSchedule ? toMinutes(selectedSchedule.endTime) : null;
    const isScheduledNow = Boolean(
      selectedSchedule &&
      selectedSchedule.day === today &&
      start !== null &&
      end !== null &&
      currentMinutes >= start &&
      currentMinutes < end
    );
    setMatchedSchedule(isScheduledNow ? selectedSchedule : null);
    setHasChecked(true);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Verify Class Session" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Instructor access</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Check your scheduled class</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <form onSubmit={handleCheck} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <CalendarClock className="h-5 w-5 text-[#1b325f]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">Class details</h2>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Scheduled class
              <select
                required
                value={selectedScheduleId}
                onChange={(event) => {
                  setSelectedScheduleId(event.target.value);
                  clearResult();
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1b325f] focus:ring-2 focus:ring-[#1b325f]/15"
              >
                <option value="" disabled>Select a class from your schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.subject} · {schedule.day}, {schedule.startTime}–{schedule.endTime} · {schedule.room}
                  </option>
                ))}
              </select>
            </label>

            <p className="text-xs text-slate-500">Current computer time: {currentTimeLabel}</p>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1b325f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#142547]"
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Check schedule
            </button>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-6" aria-live="polite">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <BookOpenCheck className="h-5 w-5 text-amber-700" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">Session status</h2>
            </div>

            {!hasChecked && (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Enter the class details to verify the schedule and unlock attendance.
              </p>
            )}

            {hasChecked && matchedSchedule && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-emerald-800">Scheduled class confirmed</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-xs text-slate-500">Subject</dt><dd className="font-medium text-slate-900">{matchedSchedule.subject}</dd></div>
                  <div><dt className="text-xs text-slate-500">Schedule</dt><dd className="font-medium text-slate-900">{matchedSchedule.day}, {matchedSchedule.startTime} - {matchedSchedule.endTime}</dd></div>
                  <div><dt className="text-xs text-slate-500">Room</dt><dd className="font-medium text-slate-900">{matchedSchedule.room || 'Not specified'}</dd></div>
                </dl>
                <button
                  type="button"
                  onClick={() => onStartAttendance(matchedSchedule)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  Open attendance <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {hasChecked && !matchedSchedule && (
              <div className="mt-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>
                  {schedules.length === 0
                    ? 'No schedules are configured yet. Ask an administrator to add your class schedule first.'
                    : 'That class is not scheduled for the current day and time. Attendance opens during its scheduled time.'}
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};