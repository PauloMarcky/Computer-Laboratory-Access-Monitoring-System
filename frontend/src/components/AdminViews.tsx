import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ClamsHeader } from './ClamsHeader';
import {
  ClassReportSubmission,
  ScheduleEntry,
  TeacherWorkload,
  WireframeScreenId,
} from '../types';

interface AdminSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeScreen, onNavigate }) => {
  const isSchedules =
    activeScreen === 'admin-schedule-module' ||
    activeScreen === 'admin-schedule-add-module' ||
    activeScreen === 'admin-teacher-workload';
  const isReports = activeScreen === 'admin-reports-dashboard';
  const isAnalytics = activeScreen === 'admin-students-analytics';

  return (
    <div className="bg-white border-b border-slate-200 px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onNavigate('admin-schedule-module')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isSchedules
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Schedules
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-reports-dashboard')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isReports
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Reports
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-teacher-workload')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'admin-teacher-workload'
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Room &amp; Workload
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-students-analytics')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isAnalytics
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Analytics
          </button>
        </nav>

        {isSchedules && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg my-1.5">
            <button
              type="button"
              onClick={() => onNavigate('admin-schedule-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'admin-schedule-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Timetable Grid
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin-schedule-add-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'admin-schedule-add-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Schedule Form
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin-teacher-workload')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'admin-teacher-workload'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Teacher Workload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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

const TIME_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'];

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

        {/* Timetable Grid */}
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
                {TIME_SLOTS.map((slot) => (
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
  const [startTime, setStartTime] = useState(editingSchedule?.startTime || '02:00 PM');
  const [endTime, setEndTime] = useState(editingSchedule?.endTime || '04:00 PM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ScheduleEntry = {
      id: editingSchedule?.id || `sch-${Date.now()}`,
      day: selectedDay,
      startTime,
      endTime,
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
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white font-mono tabular-nums text-slate-800 font-medium focus:outline-none focus:border-[#1b325f]"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
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

interface AdminTeacherWorkloadProps {
  workloads: TeacherWorkload[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminTeacherWorkloadView: React.FC<AdminTeacherWorkloadProps> = ({
  workloads,
  onNavigate,
}) => {
  const [expandedId, setExpandedId] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Staff');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = workloads.filter((t) => {
    const matchesDept = deptFilter === 'All Departments' || t.department === deptFilter;
    const matchesStatus = statusFilter === 'All Staff' || t.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedSubjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-teacher-workload" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Teacher Assignment &amp; Workload
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track teacher workloads, assign subjects, and resolve individual weekly timetables.
          </p>
        </div>

        {/* Filter Bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                {[...new Set(workloads.map((teacher) => teacher.department))].map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Workload Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Staff">All Staff</option>
                {[...new Set(workloads.map((teacher) => teacher.status))].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachers, subjects..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b325f]"
            />
          </div>
        </section>

        {/* Expandable Teacher Workload Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500">
                  <th className="py-3.5 px-5">Teacher Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Subjects</th>
                  <th className="py-3.5 px-4">Total Hours</th>
                  <th className="py-3.5 px-5 text-right">Schedule Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => {
                  const isExpanded = expandedId === teacher.id;
                  const initials = teacher.name
                    .replace(/^(Dr\.|Prof\.)\s+/, '')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <React.Fragment key={teacher.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? '' : teacher.id)}
                        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                          }`}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-slate-400 rotate-90 shrink-0" />
                            )}
                            <div className="w-7 h-7 rounded-full bg-[#1b325f] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{teacher.department}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {teacher.assignedSubjects.map((sub) => (
                              <span
                                key={sub}
                                className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 font-mono tabular-nums">
                          {teacher.totalHours} hrs/wk
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${teacher.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                              }`}
                          >
                            {teacher.status}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={5} className="px-6 py-5 border-t border-slate-100">
                            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                              Weekly Schedule Breakdown
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              {(
                                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
                              ).map((dayName) => {
                                const slot = teacher.weeklyBreakdown[dayName];
                                return (
                                  <div
                                    key={dayName}
                                    className="bg-white rounded-lg border border-slate-200/90 p-3"
                                  >
                                    <div className="text-[11px] font-bold text-slate-800 mb-1.5">
                                      {dayName}
                                    </div>
                                    {slot ? (
                                      <div className="text-[11px] text-slate-600 leading-relaxed">
                                        <span className="font-semibold text-slate-800">
                                          {slot.title}
                                        </span>{' '}
                                        <span className="font-mono tabular-nums text-slate-500">
                                          {slot.detail}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="text-[11px] text-slate-300 italic">
                                        No assignment
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

interface AdminReportsDashboardProps {
  reports: ClassReportSubmission[];
  onSelectReport: (report: ClassReportSubmission) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminReportsDashboardView: React.FC<AdminReportsDashboardProps> = ({
  reports,
  onSelectReport,
  onNavigate,
}) => {
  const [labFilter, setLabFilter] = useState('All Labs');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [instructorFilter, setInstructorFilter] = useState('All Instructors');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [todayOnly, setTodayOnly] = useState(false);

  const filteredReports = reports.filter((r) => {
    const matchesLab = labFilter === 'All Labs' || r.labRoom === labFilter;
    const matchesSubject =
      subjectFilter === 'All Subjects' || r.subjectCode === subjectFilter;
    const matchesInstructor =
      instructorFilter === 'All Instructors' || r.instructor === instructorFilter;
    const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter;
    const matchesDate = !todayOnly || r.date === new Date().toISOString().slice(0, 10);
    return (
      matchesLab && matchesSubject && matchesInstructor && matchesStatus && matchesDate
    );
  });

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-reports-dashboard" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve class laboratory log submissions from instructors.
          </p>
        </div>

        {/* Filter Bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-wrap items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Lab:</span>
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Labs">All Labs</option>
              {[...new Set(reports.map((report) => report.labRoom))].map((labRoom) => (
                <option key={labRoom} value={labRoom}>{labRoom}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Subjects">All Subjects</option>
              {[...new Set(reports.map((report) => report.subjectCode))].map((subjectCode) => (
                <option key={subjectCode} value={subjectCode}>{subjectCode}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Instructor:</span>
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Instructors">All Instructors</option>
              {[...new Set(reports.map((report) => report.instructor))].map((instructor) => (
                <option key={instructor} value={instructor}>{instructor}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setTodayOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${todayOnly
              ? 'bg-[#1b325f] border-[#1b325f] text-white'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>
        </section>

        {/* Class Reports Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-400">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Subject Code</th>
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Lab Room</th>
                  <th className="py-3.5 px-4">Session Time</th>
                  <th className="py-3.5 px-4">Students</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No reports.
                    </td>
                  </tr>
                )}
                {filteredReports.map((rep) => {
                  const badgeStyle =
                    rep.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : rep.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700';

                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {rep.date}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {rep.subjectCode}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {rep.subjectName}
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {rep.instructor}
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {rep.labRoom}
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {rep.sessionTime}
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums font-bold text-slate-700 whitespace-nowrap">
                        {rep.studentsPresent} / {rep.studentsTotal}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${badgeStyle}`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectReport(rep);
                            onNavigate('lab-staff-report-detail');
                          }}
                          className="font-bold text-[#2563eb] hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredReports.length} reports</span>
          </div>
        </section>
      </main>
    </div>
  );
};

interface AdminAnalyticsProps {
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminStudentsAnalyticsView: React.FC<AdminAnalyticsProps> = ({
  onNavigate,
}) => {
  const [college, setCollege] = useState('');
  const [unmaskNames, setUnmaskNames] = useState(false);

  const subjectAbsences: Array<{
    code: string;
    count: number;
    color: string;
    heightPct: number;
  }> = [];
  const topAbsentStudents: Array<{
    id: string;
    masked: string;
    fullName: string;
    course: string;
    days: number;
    severity: 'critical' | 'warning';
  }> = [];

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-students-analytics" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        {/* Top Title & College Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-900">Attendance Analytics</h1>

          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
          >
            <option value="">Select a college</option>
          </select>
        </div>

        {/* 4 KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Total Registered
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono tabular-nums">
              —
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Avg Attendance Rate
            </div>
            <div className="text-2xl font-bold text-[#1e3a8a] mt-1.5 font-mono tabular-nums">
              —
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Total Absences (Sem)
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1.5 font-mono tabular-nums">
              —
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Students At Risk
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1.5 font-mono tabular-nums">
              —
            </div>
          </div>
        </div>

        {/* Main Charts & Top Absent Students Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (2 Stacked Charts) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Monthly Absence Rate Line Chart */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-900">
                  Monthly Absence Rate (%)
                </h2>
                <span className="text-[11px] text-slate-400">—</span>
              </div>

              <div className="h-44 w-full flex items-center justify-center text-xs text-slate-400">
                No attendance data.
              </div>
            </section>

            {/* Total Absences by Subject Code Bar Chart */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-6">
              <h2 className="text-xs font-bold text-slate-900 mb-6">
                Total Absences by Subject Code
              </h2>

              <div className="h-44 flex items-end justify-around gap-4 pt-6 px-4 border-b border-slate-100">
                {subjectAbsences.length === 0 && (
                  <p className="text-xs text-slate-400">No absence data.</p>
                )}
                {subjectAbsences.map((item) => (
                  <div
                    key={item.code}
                    className="flex flex-col items-center justify-end h-full w-16"
                  >
                    <span className="text-[11px] font-bold text-slate-700 font-mono tabular-nums mb-1.5">
                      {item.count}
                    </span>
                    <div
                      style={{ height: `${item.heightPct}%` }}
                      className={`w-9 rounded-t-md transition-all ${item.color}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-around gap-4 pt-2.5 px-4">
                {subjectAbsences.map((item) => (
                  <div
                    key={item.code}
                    className="w-16 text-center text-[10px] font-bold text-slate-400 font-mono"
                  >
                    {item.code}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Top Absent Students */}
          <section className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold text-slate-900">Top Absent Students</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compliance tracking with privacy-masked names
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUnmaskNames((v) => !v)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#1b325f] cursor-pointer"
                title="Toggle Privacy Mask"
              >
                {unmaskNames ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Mask</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Unmask</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {topAbsentStudents.length === 0 && (
                <p className="text-xs text-slate-400">No student data.</p>
              )}
              {topAbsentStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {st.severity === 'critical' ? (
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {unmaskNames ? st.fullName : st.masked}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        {st.course}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono tabular-nums ${st.severity === 'critical'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                      }`}
                  >
                    {st.days} Days
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
