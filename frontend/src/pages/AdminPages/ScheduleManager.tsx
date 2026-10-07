import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Trash2, Users, X } from 'lucide-react';
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

/* Draft used when the user opens the "create" modal */
const createDraft = (day: ScheduleEntry['day'] = 'Mon', startTime = '02:00 PM'): ScheduleEntry => ({
  id: '',
  instructorId: 0,
  labRoomId: 0,
  day,
  startTime,
  endTime: '04:00 PM',
  subject: '',
  teacher: '',
  room: '',
  department: '',
  semester: '',
  colorTheme: 'blue',
  termId: null,
  section: 'A',
  yearLevel: 1,
});

/* ================================================================
 * FORM MODAL — create or edit one schedule
 * ================================================================ */

interface ScheduleFormModalProps {
  editingSchedule: ScheduleEntry;
  instructors: ScheduleInstructorOption[];
  labRooms: ScheduleLabRoomOption[];
  token: string;
  onSaveSchedule: (entry: ScheduleEntry) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onManageRoster: (entry: ScheduleEntry) => void;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  editingSchedule,
  instructors,
  labRooms,
  token,
  onSaveSchedule,
  onDeleteSchedule,
  onManageRoster,
  onClose,
  onSaved,
  onDeleted,
}) => {
  const isEdit = editingSchedule.id !== '';

  const [labRoomId, setLabRoomId] = useState(editingSchedule.labRoomId || 0);
  const [instructorId, setInstructorId] = useState(editingSchedule.instructorId || 0);
  const [selectedDay, setSelectedDay] = useState<ScheduleEntry['day']>(editingSchedule.day);
  const [startTime, setStartTime] = useState(toInputTime(editingSchedule.startTime));
  const [endTime, setEndTime] = useState(toInputTime(editingSchedule.endTime));

  const [subjectCode, setSubjectCode] = useState(editingSchedule.subject || '');
  const [termId, setTermId] = useState<number | ''>(editingSchedule.termId ?? '');
  const [section, setSection] = useState<string>(editingSchedule.section || 'A');
  const [yearLevel, setYearLevel] = useState<number>(editingSchedule.yearLevel ?? 1);

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<number[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* Load subjects + terms */
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

        if (!isEdit && termJson.terms?.length) {
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
  }, [token, isEdit]);

  /* Load instructor subject assignments */
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

    const selectedTerm = terms.find((t) => t.id === termId);

    const newEntry: ScheduleEntry = {
      id: editingSchedule.id,
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
      colorTheme: editingSchedule.colorTheme || 'blue',
      termId: termId || null,
      section,
      yearLevel,
    };

    try {
      await onSaveSchedule(newEntry);
      onSaved();
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Unable to save schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setActionError('');
    try {
      await onDeleteSchedule(editingSchedule.id);
      onDeleted();
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : 'Unable to delete schedule.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="animate-pop-in relative my-8 w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-slate-100 bg-white px-6 py-4">
          <h1 className="text-base font-bold text-slate-900">
            {isEdit ? 'Edit Schedule' : 'Create Schedule'}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Laboratory Room</label>
              <select
                required
                value={labRoomId || ''}
                onChange={(e) => setLabRoomId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#1b325f] focus:outline-none"
              >
                <option value="" disabled>Select a lab room</option>
                {labRooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.roomName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Subject</label>
              <select
                required
                disabled={loadingOptions}
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#1b325f] focus:outline-none disabled:opacity-60"
              >
                <option value="" disabled>
                  {loadingOptions ? 'Loading subjects...' : 'Select a subject'}
                </option>
                {subjects.some((s) => assignedSubjectIds.includes(s.id)) && (
                  <optgroup label="Assigned to selected teacher">
                    {subjects.filter((s) => assignedSubjectIds.includes(s.id)).map((s) => (
                      <option key={s.id} value={s.code}>{s.code} — {s.title}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Other subjects">
                  {subjects.filter((s) => !assignedSubjectIds.includes(s.id)).map((s) => (
                    <option key={s.id} value={s.code}>{s.code} — {s.title}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Assigned Teacher</label>
              <select
                required
                value={instructorId || ''}
                onChange={(e) => setInstructorId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#1b325f] focus:outline-none"
              >
                <option value="" disabled>Select an instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Semester / Term</label>
              <select
                required
                disabled={loadingOptions}
                value={termId}
                onChange={(e) => setTermId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#1b325f] focus:outline-none disabled:opacity-60"
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
              <label className="mb-1.5 block font-semibold text-slate-600">Section</label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                placeholder="A"
                maxLength={10}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium uppercase text-slate-800 focus:border-[#1b325f] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Year Level</label>
              <select
                required
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#1b325f] focus:outline-none"
              >
                {YEAR_LEVELS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          {actionError && (
            <p role="alert" className="text-xs font-medium text-rose-700">{actionError}</p>
          )}

          <div className="text-xs">
            <label className="mb-2 block font-semibold text-slate-600">Day of Week</label>
            <div className="grid grid-cols-5 gap-2.5">
              {ALL_DAYS.map((day) => {
                const active = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`cursor-pointer rounded-lg py-2.5 font-semibold transition-colors ${active
                        ? 'bg-[#2563eb] text-white shadow-2xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono font-medium tabular-nums text-slate-800 focus:border-[#1b325f] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-slate-600">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono font-medium tabular-nums text-slate-800 focus:border-[#1b325f] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              {isEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={isSaving}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100/70 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onManageRoster(editingSchedule)}
                    disabled={!/^\d+$/.test(editingSchedule.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Manage Students</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !instructors.length || !labRooms.length || loadingOptions}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================================================================
 * MAIN VIEW — calendar + form modal
 * ================================================================ */

interface AdminScheduleModuleProps {
  schedules: ScheduleEntry[];
  instructors: ScheduleInstructorOption[];
  labRooms: ScheduleLabRoomOption[];
  token: string;
  onSaveSchedule: (entry: ScheduleEntry) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onDeleteAllSchedules: () => Promise<void>;
  onManageRoster: (entry: ScheduleEntry) => void;
  isLoading: boolean;
  error: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminScheduleModuleView: React.FC<AdminScheduleModuleProps> = ({
  schedules,
  instructors,
  labRooms,
  token,
  onSaveSchedule,
  onDeleteSchedule,
  onDeleteAllSchedules,
  onManageRoster,
  isLoading,
  error,
  onNavigate,
}) => {
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [semFilter, setSemFilter] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  /* Modal state — non-null = open */
  const [modalSchedule, setModalSchedule] = useState<ScheduleEntry | null>(null);

  const openCreate = (day?: ScheduleEntry['day'], startTime?: string) => {
    setModalSchedule(createDraft(day, startTime));
  };
  const openEdit = (entry: ScheduleEntry) => {
    setModalSchedule(entry);
  };
  const closeModal = () => setModalSchedule(null);

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

      <div className="clams-layout">
        <AdminSubNav activeScreen="admin-schedule-module" onNavigate={onNavigate} />

        <main className="space-y-5">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="mr-1 inline-flex items-center gap-1.5 font-semibold text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-slate-400">Lab Room:</span>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="cursor-pointer bg-transparent font-bold text-slate-800 focus:outline-none"
                >
                  <option value="All Rooms">All Rooms</option>
                  {[...new Set(schedules.map((s) => s.room))].map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-slate-400">Semester:</span>
                <select
                  value={semFilter}
                  onChange={(e) => setSemFilter(e.target.value)}
                  className="cursor-pointer bg-transparent font-bold text-slate-800 focus:outline-none"
                >
                  <option value="">All Semesters</option>
                  {[...new Set(schedules.map((s) => s.semester))].map((semester) => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(true)}
                disabled={!schedules.length || isLoading || isDeletingAll}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeletingAll ? 'Deleting...' : 'Delete All Schedule'}</span>
              </button>
              <button
                type="button"
                onClick={() => openCreate('Mon', '02:00 PM')}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
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
            <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-700">
                      <th className="w-28 border-r border-slate-100 px-4 py-3.5 text-left font-semibold text-slate-400">
                        Time
                      </th>
                      {DAYS.map((day) => (
                        <th key={day.key} className="border-r border-slate-100 px-4 py-3.5 text-center last:border-r-0">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {timeSlots.map((slot) => (
                      <tr key={slot} className="h-28">
                        <td className="border-r border-slate-100 p-3 text-center align-middle font-mono text-[11px] font-semibold tabular-nums text-slate-400">
                          {slot}
                        </td>
                        {DAYS.map((day) => {
                          const cellEntries = groupedSchedules[`${day.key}|${slot}`] || [];
                          return (
                            <td key={day.key} className="border-r border-slate-100 p-2 align-top last:border-r-0">
                              {cellEntries.length > 0 ? (
                                <div className="space-y-1.5">
                                  {cellEntries.map((entry) => (
                                    <button
                                      key={`${entry.id}-${entry.room}-${entry.subject}`}
                                      type="button"
                                      onClick={() => openEdit(entry)}
                                      className={`flex min-h-[92px] w-full cursor-pointer flex-col justify-between rounded-lg p-2.5 text-left transition-colors ${getColorClasses(entry.colorTheme)}`}
                                    >
                                      <div>
                                        <div className="line-clamp-1 text-xs font-bold leading-snug">{entry.subject}</div>
                                        <div className="mt-0.5 truncate text-[11px] opacity-80">{entry.teacher}</div>
                                      </div>
                                      <div className="mt-2 text-[10px] font-bold opacity-90">{entry.room}</div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openCreate(day.key, slot)}
                                  className="flex h-full min-h-[92px] w-full cursor-pointer items-center justify-center rounded-lg border border-transparent text-[11px] text-slate-300 transition-colors hover:border-dashed hover:border-slate-300 hover:bg-slate-50/70 hover:text-slate-500"
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
            <section className="rounded-xl border border-slate-200/90 bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">No schedules assigned yet.</p>
            </section>
          )}
        </main>
      </div>

      {/* Schedule form modal */}
      {modalSchedule && (
        <ScheduleFormModal
          editingSchedule={modalSchedule}
          instructors={instructors}
          labRooms={labRooms}
          token={token}
          onSaveSchedule={onSaveSchedule}
          onDeleteSchedule={onDeleteSchedule}
          onManageRoster={onManageRoster}
          onClose={closeModal}
          onSaved={closeModal}
          onDeleted={closeModal}
        />
      )}

      {/* Delete-all confirmation modal */}
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