import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL, readApiResponse } from '../../api';
import type { WireframeScreenId } from '../../types';

interface SubjectLite {
  id: number;
  code: string;
  title: string;
  yearLevel: number | null;
}

interface InstructorRow {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  schoolId: string;
  subjects: SubjectLite[];
  scheduleCount: number;
}

interface AdminTeacherWorkloadProps {
  token: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminTeacherWorkloadView: React.FC<AdminTeacherWorkloadProps> = ({
  token,
  onNavigate,
}) => {
  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectLite[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Per-row subject dropdown state
  const [pendingSubject, setPendingSubject] = useState<Record<number, number | ''>>({});
  const [busy, setBusy] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [workloadRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/instructor-subjects/workload`, { headers }),
        fetch(`${API_BASE_URL}/subjects`, { headers }),
      ]);
      const workloadData = await readApiResponse<{ instructors: InstructorRow[]; error?: string }>(workloadRes);
      const subjectsData = await readApiResponse<{ subjects: SubjectLite[]; error?: string }>(subjectsRes);
      if (!workloadRes.ok) throw new Error(workloadData.error || 'Unable to load instructors.');
      if (!subjectsRes.ok) throw new Error(subjectsData.error || 'Unable to load subjects.');
      setInstructors(workloadData.instructors);
      setAllSubjects(subjectsData.subjects);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workload data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAssign = async (instructorId: number) => {
    const subjectId = pendingSubject[instructorId];
    if (!subjectId) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/instructor-subjects/${instructorId}/subjects`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      });
      const data = await readApiResponse<{ error?: string; link: { subject: SubjectLite } }>(res);
      if (!res.ok) throw new Error(data.error || 'Unable to assign subject.');
      setInstructors((prev) =>
        prev.map((i) =>
          i.id === instructorId ? { ...i, subjects: [...i.subjects, data.link.subject] } : i
        )
      );
      setPendingSubject((prev) => ({ ...prev, [instructorId]: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to assign subject.');
    } finally {
      setBusy(false);
    }
  };

  const handleUnassign = async (instructorId: number, subjectId: number) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/instructor-subjects/${instructorId}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const data = await readApiResponse<{ error?: string }>(res);
        throw new Error(data.error || 'Unable to remove subject.');
      }
      setInstructors((prev) =>
        prev.map((i) =>
          i.id === instructorId
            ? { ...i, subjects: i.subjects.filter((s) => s.id !== subjectId) }
            : i
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to remove subject.');
    } finally {
      setBusy(false);
    }
  };

  const filteredInstructors = instructors.filter((i) => {
    const matchesSubject =
      subjectFilter === 'All Subjects' || i.subjects.some((subject) => String(subject.id) === subjectFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      i.name.toLowerCase().includes(q) ||
      i.subjects.some((s) => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-teacher-workload" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">
        {/* Filter bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Subjects">All Subjects</option>
                {allSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.title}
                  </option>
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
              placeholder="Search instructors or subjects..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b325f]"
            />
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </p>
        )}

        {/* Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500">
                  <th className="py-3.5 px-5">Instructor</th>
                  <th className="py-3.5 px-4">School ID</th>
                  <th className="py-3.5 px-4">Assigned Subjects</th>
                  <th className="py-3.5 px-5 text-right">Schedules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400">
                      Loading instructors...
                    </td>
                  </tr>
                ) : filteredInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400">
                      No instructors found.
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((teacher) => {
                    const isExpanded = expandedId === teacher.id;
                    const initials = teacher.name
                      .replace(/^(Dr\.|Prof\.)\s+/, '')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    const availableSubjects = allSubjects.filter(
                      (s) => !teacher.subjects.some((ts) => ts.id === s.id)
                    );

                    return (
                      <React.Fragment key={teacher.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : teacher.id)}
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
                              <div>
                                <div className="font-bold text-slate-900">{teacher.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-600">
                            {teacher.schoolId}
                          </td>
                          <td className="py-4 px-4">
                            {teacher.subjects.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">
                                No subjects assigned
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {teacher.subjects.map((sub) => (
                                  <span
                                    key={sub.id}
                                    className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap"
                                  >
                                    {sub.code}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right font-mono tabular-nums text-slate-700">
                            {teacher.scheduleCount}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={4} className="px-6 py-5 border-t border-slate-100">
                              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                                Manage Subjects for {teacher.name}
                              </div>

                              <div className="space-y-2 mb-4">
                                {teacher.subjects.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic">
                                    This instructor has no subjects assigned yet.
                                  </p>
                                ) : (
                                  teacher.subjects.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-slate-800 text-xs">
                                          {sub.code}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                          {sub.title}
                                        </span>
                                        {sub.yearLevel != null && (
                                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                                            Year {sub.yearLevel}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleUnassign(teacher.id, sub.id)}
                                        disabled={busy}
                                        className="p-1.5 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-50"
                                        title="Remove"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={pendingSubject[teacher.id] ?? ''}
                                  onChange={(e) =>
                                    setPendingSubject((prev) => ({
                                      ...prev,
                                      [teacher.id]: e.target.value ? Number(e.target.value) : '',
                                    }))
                                  }
                                  disabled={availableSubjects.length === 0}
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#1b325f] disabled:opacity-60"
                                >
                                  <option value="">
                                    {availableSubjects.length === 0
                                      ? 'All subjects already assigned'
                                      : 'Select a subject to add...'}
                                  </option>
                                  {availableSubjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.code} — {s.title}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAssign(teacher.id)}
                                  disabled={busy || !pendingSubject[teacher.id]}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Assign
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};