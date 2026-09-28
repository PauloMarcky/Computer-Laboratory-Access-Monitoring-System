import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import type { ScheduleEntry, WireframeScreenId } from '../../types';

interface AdminScheduleModuleProps {
  schedules: ScheduleEntry[];
  onEditSchedule: (entry: ScheduleEntry) => void;
  onCreateNewSchedule: (day?: ScheduleEntry['day'], startTime?: string) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

const DAYS: Array<{ key: ScheduleEntry['day']; label: string }> = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
];

const timeToMinutes = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const [, hourText, minuteText, period] = match;
  let hour = Number(hourText) % 12;
  if (period.toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(minuteText);
};

const toInputTime = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '14:00';
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const toScheduleTime = (time: string) => {
  const [hourText, minute] = time.split(':');
  const hour = Number(hourText);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${period}`;
};

export const AdminScheduleModuleView: React.FC<AdminScheduleModuleProps> = ({
  schedules,
  onEditSchedule,
  onCreateNewSchedule,
  onNavigate,
}) => {
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [deptFilter, setDeptFilter] = useState('All Depts');
  const [semFilter, setSemFilter] = useState('');

  const filteredSchedules = schedules.filter((s) => {
    const matchesRoom = roomFilter === 'All Rooms' || s.room.includes(roomFilter);
    const matchesDept = deptFilter === 'All Depts' || s.department === deptFilter;
    const matchesSem = !semFilter || s.semester === semFilter;
    return matchesRoom && matchesDept && matchesSem;
  });
  const timeSlots = [...new Set(filteredSchedules.map((s) => s.startTime))]
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const getColorClasses = (theme: ScheduleEntry['colorTheme']) => {
    switch (theme) {
      case 'blue':
        return 'bg-sky-50/95 border-l-4 border-sky-600 text-sky-950 hover:bg-sky-100/80';
      case 'green':
        return 'bg-emerald-50/95 border-l-4 border-emerald-600 text-emerald-950 hover:bg-emerald-100/80';
      case 'amber':
        return 'bg-amber-50/95 border-l-4 border-amber-500 text-amber-950 hover:bg-amber-100/80';
      case 'purple':
        return 'bg-purple-50/95 border-l-4 border-purple-600 text-purple-950 hover:bg-purple-100/80';
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-schedule-module" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Filter & Create Bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Lab Room:</span>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Rooms">All Rooms</option>
                {[...new Set(schedules.map((schedule) => schedule.room))].map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Depts">All Depts</option>
                {[...new Set(schedules.map((schedule) => schedule.department))].map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Semester:</span>
              <select
                value={semFilter}
                onChange={(e) => setSemFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">All Semesters</option>
                {[...new Set(schedules.map((schedule) => schedule.semester))].map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCreateNewSchedule('Mon', '02:00 PM')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Schedule</span>
          </button>
        </section>

        {schedules.length > 0 ? (
          <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-700">
                    <th className="w-28 py-3.5 px-4 text-left text-slate-400 font-semibold border-r border-slate-100">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day.key}
                        className="py-3.5 px-4 text-center border-r border-slate-100 last:border-r-0"
                      >
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="h-28">
                      <td className="p-3 align-middle text-center font-mono tabular-nums text-[11px] font-semibold text-slate-400 border-r border-slate-100">
                        {slot}
                      </td>

                      {DAYS.map((day) => {
                        const entry = filteredSchedules.find(
                          (s) => s.day === day.key && s.startTime === slot
                        );

                        return (
                          <td
                            key={day.key}
                            className="p-2 align-top border-r border-slate-100 last:border-r-0"
                          >
                            {entry ? (
                              <button
                                type="button"
                                onClick={() => onEditSchedule(entry)}
                                className={`w-full h-full min-h-[92px] rounded-lg p-2.5 text-left flex flex-col justify-between transition-colors cursor-pointer ${getColorClasses(
                                  entry.colorTheme
                                )}`}
                              >
                                <div>
                                  <div className="font-bold text-xs leading-snug line-clamp-1">
                                    {entry.subject}
                                  </div>
                                  <div className="text-[11px] opacity-80 mt-0.5 truncate">
                                    {entry.teacher}
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold opacity-90 mt-2">
                                  {entry.room}
                                </div>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onCreateNewSchedule(day.key, slot)}
                                className="w-full h-full min-h-[92px] rounded-lg border border-transparent hover:border-dashed hover:border-slate-300 hover:bg-slate-50/70 flex items-center justify-center text-[11px] text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                              >
                                Unassigned
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-xl border border-slate-200/90 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-500">No schedules assigned yet.</p>
          </section>
        )}
      </main>
    </div>
  );
};

interface AdminScheduleAddProps {
  editingSchedule: ScheduleEntry | null;
  onSaveSchedule: (entry: ScheduleEntry) => void;
  onDeleteSchedule: (id: string) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

const ALL_DAYS: ScheduleEntry['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AdminScheduleAddView: React.FC<AdminScheduleAddProps> = ({
  editingSchedule,
  onSaveSchedule,
  onDeleteSchedule,
  onNavigate,
}) => {
  const [room, setRoom] = useState(editingSchedule?.room || '');
  const [subject, setSubject] = useState(editingSchedule?.subject || '');
  const [teacher, setTeacher] = useState(editingSchedule?.teacher || '');
  const [semester, setSemester] = useState(editingSchedule?.semester || '');
  const [selectedDay, setSelectedDay] = useState<ScheduleEntry['day']>(
    editingSchedule?.day || 'Mon'
  );
  const [startTime, setStartTime] = useState(toInputTime(editingSchedule?.startTime || '02:00 PM'));
  const [endTime, setEndTime] = useState(toInputTime(editingSchedule?.endTime || '04:00 PM'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ScheduleEntry = {
      id: editingSchedule?.id || `sch-${Date.now()}`,
      day: selectedDay,
      startTime: toScheduleTime(startTime),
      endTime: toScheduleTime(endTime),
      subject,
      teacher,
      room,
      department: '',
      semester,
      colorTheme: editingSchedule?.colorTheme || 'blue',
    };
    onSaveSchedule(newEntry);
    onNavigate('admin-schedule-module');
  };

  const handleDelete = () => {
    if (editingSchedule) {
      onDeleteSchedule(editingSchedule.id);
    }
    onNavigate('admin-schedule-module');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-schedule-add-module" onNavigate={onNavigate} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200/90 p-7 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-base font-bold text-slate-900">Schedule Details</h1>
            <button
              type="button"
              onClick={() => onNavigate('admin-teacher-workload')}
              className="text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer"
            >
              View Teacher Workload &rarr;
            </button>
          </div>

          {/* 2x2 Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Laboratory Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
                placeholder="Laboratory room"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Subject (Searchable)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
                placeholder="Subject"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Assigned Teacher
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
                placeholder="Teacher"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
                placeholder="Semester / term"
              />
            </div>
          </div>

          {/* Day of Week Selector */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 mb-2">
              Day of Week
            </label>
            <div className="grid grid-cols-6 gap-2.5">
              {ALL_DAYS.map((day) => {
                const active = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`py-2.5 rounded-lg font-semibold transition-colors cursor-pointer ${active
                      ? 'bg-[#2563eb] text-white shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                min={startTime}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Schedule</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('admin-schedule-module')}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
