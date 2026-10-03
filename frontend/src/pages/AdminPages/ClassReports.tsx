import React, { useState } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import type { ClassReportSubmission, WireframeScreenId } from '../../types';
import { formatSchoolDate } from '../../utils/attendance-time';

interface AdminReportsDashboardProps {
  reports: ClassReportSubmission[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminReportsDashboardView: React.FC<AdminReportsDashboardProps> = ({
  reports,
  onNavigate,
}) => {
  const [labFilter, setLabFilter] = useState('All Labs');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [instructorFilter, setInstructorFilter] = useState('All Instructors');
  const [todayOnly, setTodayOnly] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesLab = labFilter === 'All Labs' || r.labRoom === labFilter;
    const matchesSubject =
      subjectFilter === 'All Subjects' || r.subjectCode === subjectFilter;
    const matchesInstructor =
      instructorFilter === 'All Instructors' || r.instructor === instructorFilter;
    const matchesDate = !todayOnly || r.date === formatSchoolDate(new Date());
    return (
      matchesLab && matchesSubject && matchesInstructor && matchesDate
    );
  });

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-reports-dashboard" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">

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
                  <th className="py-3.5 px-4">Session Status</th>
                  <th className="py-3.5 px-4 text-right">Attendance</th>
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
                {filteredReports.map((rep) => (
                  <React.Fragment key={rep.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
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
                          className="inline-block rounded bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                        >
                          Completed
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          aria-expanded={expandedReportId === rep.id}
                          onClick={() => setExpandedReportId((current) => current === rep.id ? null : rep.id)}
                          className="inline-flex items-center gap-1.5 font-bold text-[#2563eb] hover:underline cursor-pointer"
                        >
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedReportId === rep.id ? 'rotate-180' : ''}`} />
                          {expandedReportId === rep.id ? 'Hide Students' : 'View Students'}
                        </button>
                      </td>
                    </tr>
                    {expandedReportId === rep.id && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50 px-6 py-4">
                          {rep.attendanceList.length === 0 ? (
                            <p className="py-3 text-center text-xs text-slate-500">No students were recorded as present.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                              <table className="w-full border-collapse text-left text-xs">
                                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                                  <tr>
                                    <th className="px-3 py-2.5">#</th>
                                    <th className="px-3 py-2.5">Student ID</th>
                                    <th className="px-3 py-2.5">Student Name</th>
                                    <th className="px-3 py-2.5">Time In</th>
                                    <th className="px-3 py-2.5">PC</th>
                                    <th className="px-3 py-2.5">Attendance</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {rep.attendanceList.map((student, index) => (
                                    <tr key={student.id}>
                                      <td className="px-3 py-2.5 font-mono text-slate-500">{index + 1}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.studentId}</td>
                                      <td className="px-3 py-2.5 font-semibold text-slate-800">{student.formalName}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.timeIn}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.pcNumber}</td>
                                      <td className="px-3 py-2.5 text-slate-600">{student.status}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
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
