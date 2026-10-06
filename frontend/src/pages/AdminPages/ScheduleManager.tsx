import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Trash2, Users } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL } from '../../api';
import type {
  ScheduleEntry,
  ScheduleInstructorOption,
  ScheduleLabRoomOption,
  WireframeScreenId,
} from '../../types';

/* ---------------- Types for dropdown data ---------------- */

interface SubjectOption {
  id: number;
  code: string;
  title: string;
  yearLevel?: number | null;
}

interface TermOption {
  id: number;
  academicYear: string;
  semester: string;
  isActive: boolean;
}

/* ---------------- Helpers ---------------- */

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

const DAYS: Array<{ key: ScheduleEntry['day']; label: string }> = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
];

const ALL_DAYS: ScheduleEntry['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const YEAR_LEVELS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

/* ================================================================
 * LIST VIEW — calendar grid of schedules
 * ================================================================ */

interface AdminScheduleModuleProps {
  schedules: ScheduleEntry[];
  onEditSchedule: (entry: ScheduleEntry) => void;
  onCreateNewSchedule: (day?: ScheduleEntry['day'], startTime?: string) => void;
  onDeleteAllSchedules: () => Promise<void>;
  isLoading: boolean;
  error: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminScheduleModuleView: React.FC<AdminScheduleModuleProps> = ({
  schedules,
  onEditSchedule,
  onCreateNewSchedule,
  onDeleteAllSchedules,
  isLoading,
  error,
  onNavigate,
}) => {
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [deptFilter, setDeptFilter] = useState('All Depts');
  const [semFilter, setSemFilter] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const handleDeleteAllSchedules = async () => {
    setIsDeletingAll(true);
    setDeleteError('');
    try {
      await onDeleteAllSchedules();
      setIsDeleteConfirmationOpen(false);
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : 'Unable to delete schedules.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const matchesRoom = roomFilter === 'All Rooms' || s.room.includes(roomFilter);
    const matchesSem = !semFilter || s.semester === semFilter;
    return matchesRoom && matchesSem;
  });

  const timeSlots = [...new Set(filteredSchedules.map((s) => s.startTime))]
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const groupedSchedules = filteredSchedules.reduce<Record<string, ScheduleEntry[]>>((acc, schedule) => {
    const key = `${schedule.day}|${schedule.startTime}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(schedule);
    return acc;
  }, {});

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
          <div className='flex gap-2'>
            <button
              type="button"
              onClick={() => setIsDeleteConfirmationOpen(true)}
              disabled={!schedules.length || isLoading || isDeletingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeletingAll ? 'Deleting...' : 'Delete All Schedule'}</span>
            </button>
            <button
              type="button"
              onClick={() => onCreateNewSchedule('Mon', '02:00 PM')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Schedule</span>
            </button>
          </div>
        </section>

        {(error || deleteError) && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {deleteError || error}
          </p>
        )}

        {isLoading ? (
          <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Loading schedules...
          </section>
        ) : schedules.length > 0 ? (
          <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-700">
                    <th className="w-28 py-3.5 px-4 text-left text-slate-400 font-semibold border-r border-slate-100">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th key={day.key} className="py-3.5 px-4 text-center border-r border-slate-100 last:border-r-0">
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
                        const cellEntries = groupedSchedules[`${day.key}|${slot}`] || [];
                        return (
                          <td key={day.key} className="p-2 align-top border-r border-slate-100 last:border-r-0">
                            {cellEntries.length > 0 ? (
                              <div className="space-y-1.5">
                                {cellEntries.map((entry) => (
                                  <button
                                    key={`${entry.id}-${entry.room}-${entry.subject}`}
                                    type="button"
                                    onClick={() => onEditSchedule(entry)}
                                    className={`w-full min-h-[92px] rounded-lg p-2.5 text-left flex flex-col justify-between transition-colors cursor-pointer ${getColorClasses(entry.colorTheme)}`}
                                  >
                                    <div>
                                      <div className="font-bold text-xs leading-snug line-clamp-1">{entry.subject}</div>
                                      <div className="text-[11px] opacity-80 mt-0.5 truncate">{entry.teacher}</div>
                                    </div>
                                    <div className="text-[10px] font-bold opacity-90 mt-2">{entry.room}</div>
                                  </button>
                                ))}
                              </div>
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

      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-schedules-title"
            aria-describedby="delete-schedules-description"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 id="delete-schedules-title" className="text-base font-bold text-slate-900">
              Delete all schedules?
            </h2>
            <p id="delete-schedules-description" className="mt-2 text-sm leading-6 text-slate-600">
              This permanently deletes all {schedules.length} schedules, along with their enrollments and active sessions.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-700">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(false)}
                disabled={isDeletingAll}
                className="rounded-md border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteAllSchedules()}
                disabled={isDeletingAll}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {isDeletingAll ? 'Deleting...' : 'Delete all'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

/* ================================================================
 * ADD / EDIT VIEW — form to create or update one schedule
 * ================================================================ */

interface AdminScheduleAddProps {
  editingSchedule: ScheduleEntry | null;
  instructors: ScheduleInstructorOption[];
  labRooms: ScheduleLabRoomOption[];
  error: string;
  token: string;
  onSaveSchedule: (entry: ScheduleEntry) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onManageRoster: (entry: ScheduleEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminScheduleAddView: React.FC<AdminScheduleAddProps> = ({
  editingSchedule,
  instructors,
  labRooms,
  error,
  token,
  onSaveSchedule,
  onDeleteSchedule,
  onManageRoster,
  onNavigate,
}) => {
  const [labRoomId, setLabRoomId] = useState(editingSchedule?.labRoomId || 0);
  const [instructorId, setInstructorId] = useState(editingSchedule?.instructorId || 0);
  const [selectedDay, setSelectedDay] = useState<ScheduleEntry['day']>(editingSchedule?.day || 'Mon');
  const [startTime, setStartTime] = useState(toInputTime(editingSchedule?.startTime || '02:00 PM'));
  const [endTime, setEndTime] = useState(toInputTime(editingSchedule?.endTime || '04:00 PM'));

  const [subjectCode, setSubjectCode] = useState(editingSchedule?.subject || '');
  const [termId, setTermId] = useState<number | ''>(editingSchedule?.termId ?? '');
  const [section, setSection] = useState<string>(editingSchedule?.section || 'A');
  const [yearLevel, setYearLevel] = useState<number>(editingSchedule?.yearLevel ?? 1);

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<number[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [subRes, termRes] = await Promise.all([
          fetch(`${API_BASE_URL}/subjects`, { headers }),
          fetch(`${API_BASE_URL}/terms`, { headers }),
        ]);
        const subJson = await subRes.json();
        const termJson = await termRes.json();
        if (cancelled) return;
        setSubjects(subJson.subjects || []);
        setTerms(termJson.terms || []);

        if (!editingSchedule && termJson.terms?.length) {
          const active = termJson.terms.find((t: TermOption) => t.isActive);
          if (active) setTermId(active.id);
        }
      } catch {
        if (!cancelled) setActionError('Could not load subjects or terms.');
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [token, editingSchedule]);

  useEffect(() => {
    let cancelled = false;
    const loadAssignments = async () => {
      if (!instructorId) {
        setAssignedSubjectIds([]);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/instructor-subjects/${instructorId}/subjects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load instructor subjects.');
        if (!cancelled) setAssignedSubjectIds((data.subjects || []).map((subject: SubjectOption) => subject.id));
      } catch {
        if (!cancelled) setAssignedSubjectIds([]);
      }
    };
    void loadAssignments();
    return () => { cancelled = true; };
  }, [instructorId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionError('');

    const selectedSubject = subjects.find((s) => s.code === subjectCode);
    const selectedTerm = terms.find((t) => t.id === termId);

    const newEntry: ScheduleEntry = {
      id: editingSchedule?.id || '',
      instructorId,
      labRoomId,
      day: selectedDay,
      startTime: toScheduleTime(startTime),
      endTime: toScheduleTime(endTime),
      subject: subjectCode,
      teacher: instructors.find((i) => i.id === instructorId)
        ? `${instructors.find((i) => i.id === instructorId)!.firstName} ${instructors.find((i) => i.id === instructorId)!.lastName}`
        : '',
      room: labRooms.find((r) => r.id === labRoomId)?.roomName || '',
      department: instructors.find((i) => i.id === instructorId)?.department || '',
      semester: selectedTerm ? `${selectedTerm.academicYear} ${selectedTerm.semester}` : '',
      colorTheme: editingSchedule?.colorTheme || 'blue',
      termId: termId || null,
      section,
      yearLevel,
    };

    try {
      await onSaveSchedule(newEntry);
      onNavigate('admin-schedule-module');
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Unable to save schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingSchedule) {
      setActionError('');
      try {
        await onDeleteSchedule(editingSchedule.id);
      } catch (deleteError) {
        setActionError(deleteError instanceof Error ? deleteError.message : 'Unable to delete schedule.');
        return;
      }
    }
    onNavigate('admin-schedule-module');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-schedule-add-module" onNavigate={onNavigate} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-base font-bold text-slate-900">Schedule Details</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Laboratory Room</label>
              <select
                required
                value={labRoomId || ''}
                onChange={(e) => setLabRoomId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              >
                <option value="" disabled>Select a lab room</option>
                {labRooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.roomName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Subject</label>
              <select
                required
                disabled={loadingOptions}
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f] disabled:opacity-60"
              >
                <option value="" disabled>
                  {loadingOptions ? 'Loading subjects...' : 'Select a subject'}
                </option>
                {subjects.some((subject) => assignedSubjectIds.includes(subject.id)) && (
                  <optgroup label="Assigned to selected teacher">
                    {subjects
                      .filter((subject) => assignedSubjectIds.includes(subject.id))
                      .map((subject) => (
                        <option key={subject.id} value={subject.code}>
                          {subject.code} — {subject.title}
                        </option>
                      ))}
                  </optgroup>
                )}
                <optgroup label="Other subjects">
                  {subjects
                    .filter((subject) => !assignedSubjectIds.includes(subject.id))
                    .map((subject) => (
                      <option key={subject.id} value={subject.code}>
                        {subject.code} — {subject.title}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Assigned Teacher</label>
              <select
                required
                value={instructorId || ''}
                onChange={(e) => setInstructorId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              >
                <option value="" disabled>Select an instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Semester / Term</label>
              <select
                required
                disabled={loadingOptions}
                value={termId}
                onChange={(e) => setTermId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f] disabled:opacity-60"
              >
                <option value="" disabled>
                  {loadingOptions ? 'Loading terms...' : 'Select a term'}
                </option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.academicYear} · {t.semester}{t.isActive ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Section</label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                placeholder="A"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f] uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Year Level</label>
              <select
                required
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              >
                {YEAR_LEVELS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          {(error || actionError) && (
            <p role="alert" className="text-xs font-medium text-rose-700">{actionError || error}</p>
          )}

          <div className="text-xs">
            <label className="block font-semibold text-slate-600 mb-2">Day of Week</label>
            <div className="grid grid-cols-5 gap-2.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              />
            </div>
          </div>

          {/* Footer — one row with delete/roster on the left and cancel/save on the right */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={!editingSchedule || isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => editingSchedule && onManageRoster(editingSchedule)}
                disabled={!editingSchedule || !/^\d+$/.test(editingSchedule.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Student Enrollment</span>
              </button>
            </div>

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
                disabled={isSaving || !instructors.length || !labRooms.length || loadingOptions}
                className="px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};