import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import type { TeacherWorkload, WireframeScreenId } from '../../types';

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
