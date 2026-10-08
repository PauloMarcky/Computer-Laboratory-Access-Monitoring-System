import React, { useEffect, useState } from 'react';
import { Plus, Pencil, X, Archive, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL, readApiResponse } from '../../api';
import type { WireframeScreenId } from '../../types';

interface Subject {
  id: number;
  code: string;
  title: string;
  yearLevel: number | null;
  isActive: boolean;
}

interface SubjectUsage {
  scheduleCount: number;
  instructorCount: number;
}

interface Props {
  token: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

type NoticeType = 'success' | 'archive' | 'error';

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

const yearBadgeClasses = (year: number | null): string => {
  switch (year) {
    case 1: return 'bg-sky-100 text-sky-800 border-sky-200';
    case 2: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 3: return 'bg-amber-100 text-amber-800 border-amber-200';
    case 4: return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const SubjectManagerView: React.FC<Props> = ({ token, onNavigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState<{ code: string; title: string; yearLevel: number | null }>({
    code: '',
    title: '',
    yearLevel: 1,
  });
  const [saving, setSaving] = useState(false);

  // Toast
  const [successNotice, setSuccessNotice] = useState('');
  const [noticeType, setNoticeType] = useState<NoticeType>('success');

  // Archive confirmation
  const [pendingArchive, setPendingArchive] = useState<Subject | null>(null);
  const [pendingArchiveUsage, setPendingArchiveUsage] = useState<SubjectUsage | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Restore
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/subjects${showArchived ? '?includeArchived=true' : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse<{ subjects: Subject[] }>(res);
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, showArchived]);

  useEffect(() => {
    if (!successNotice) return;
    const timer = window.setTimeout(() => setSuccessNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [successNotice]);

  const showSuccess = (message: string, type: NoticeType = 'success') => {
    setNoticeType(type);
    setSuccessNotice(message);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', title: '', yearLevel: 1 });
    setError('');
    setShowForm(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ code: s.code, title: s.title, yearLevel: s.yearLevel ?? null });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editing ? `${API_BASE_URL}/subjects/${editing.id}` : `${API_BASE_URL}/subjects`;
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await readApiResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setShowForm(false);
      await load();
      showSuccess(
        editing
          ? `Subject ${form.code} updated successfully.`
          : `Subject ${form.code} created successfully.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const confirmArchive = async (s: Subject) => {
    setError('');
    setPendingArchive(s);
    setPendingArchiveUsage(null);
    setLoadingUsage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/subjects/${s.id}/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse<SubjectUsage & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Unable to load subject usage.');
      setPendingArchiveUsage({
        scheduleCount: data.scheduleCount ?? 0,
        instructorCount: data.instructorCount ?? 0,
      });
    } catch {
      setPendingArchiveUsage({ scheduleCount: 0, instructorCount: 0 });
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleArchiveConfirmed = async () => {
    if (!pendingArchive) return;
    setArchiving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/subjects/${pendingArchive.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse<{ error?: string; deletedSchedules?: number }>(res);
      if (!res.ok) throw new Error(data.error || 'Archive failed.');

      const deletedSchedules = data.deletedSchedules ?? 0;
      await load();
      showSuccess(
        deletedSchedules > 0
          ? `Subject ${pendingArchive.code} archived. ${deletedSchedules} schedule${deletedSchedules === 1 ? '' : 's'} deleted.`
          : `Subject ${pendingArchive.code} archived.`,
        'archive'
      );
      setPendingArchive(null);
      setPendingArchiveUsage(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archive failed.');
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async (s: Subject) => {
    setRestoringId(s.id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/subjects/${s.id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Restore failed.');
      await load();
      showSuccess(`Subject ${s.code} restored to the catalog.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed.');
    } finally {
      setRestoringId(null);
    }
  };

  const isArchiveToast = noticeType === 'archive';
  const isErrorToast = noticeType === 'error';
  const toastAccent = isArchiveToast || isErrorToast ? 'bg-rose-500' : 'bg-emerald-500';
  const toastBorder = isArchiveToast || isErrorToast ? 'border-rose-200' : 'border-emerald-200';
  const toastLabel = isArchiveToast || isErrorToast ? 'text-rose-600' : 'text-emerald-600';
  const toastTitle = isArchiveToast ? 'Archived' : isErrorToast ? 'Error' : 'Success';

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#eef1f7]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

      <div className="clams-layout">
        <AdminSubNav activeScreen="admin-subjects" onNavigate={onNavigate} />

        <main className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1b325f]/15 bg-gradient-to-r from-[#1b325f]/[0.04] to-transparent px-6 py-5 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-[#1b325f]">Subject Manager</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage the subject catalog used when creating schedules.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${showArchived
                  ? 'border-[#1b325f]/30 bg-[#1b325f]/10 text-[#1b325f]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showArchived ? 'Hide archived' : 'Show archived'}</span>
              </button>
              <button
                onClick={openCreate}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>

          {error && !showForm && !pendingArchive && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </p>
          )}

          <section className="overflow-hidden rounded-2xl border border-[#1b325f]/10 bg-white shadow-lg shadow-[#1b325f]/5">
            <table className="w-full text-sm">
              <thead className="bg-[#1b325f] text-xs font-bold uppercase tracking-wider text-white">
                <tr>
                  <th className="py-4 px-5 text-left font-semibold text-white/70">Code</th>
                  <th className="py-4 px-4 text-left">Title</th>
                  <th className="py-4 px-4 text-left">Year Level</th>
                  <th className="py-4 px-5 text-right font-semibold text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-slate-400">
                      Loading subjects...
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-slate-400">
                      {showArchived
                        ? 'No subjects found.'
                        : <>No active subjects. Click <span className="font-semibold text-[#1b325f]">Add Subject</span> to create one.</>}
                    </td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr
                      key={s.id}
                      className={`group transition-colors hover:bg-[#1b325f]/[0.02] ${!s.isActive ? 'opacity-60' : ''}`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#1b325f]">{s.code}</span>
                          {!s.isActive && (
                            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700">{s.title}</td>
                      <td className="py-4 px-4">
                        {s.yearLevel != null ? (
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${yearBadgeClasses(s.yearLevel)}`}>
                            {YEAR_OPTIONS.find((y) => y.value === s.yearLevel)?.label ?? `Year ${s.yearLevel}`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                          {s.isActive ? (
                            <>
                              <button
                                onClick={() => openEdit(s)}
                                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-[#1b325f]/10 hover:text-[#1b325f]"
                                title="Edit subject"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => confirmArchive(s)}
                                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-[#1b325f]/10 hover:text-[#1b325f]"
                                title="Archive subject"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => void handleRestore(s)}
                              disabled={restoringId === s.id}
                              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                              title="Restore subject"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              {restoringId === s.id ? 'Restoring...' : 'Restore'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && subjects.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
                {subjects.length} subject{subjects.length === 1 ? '' : 's'}
                {showArchived ? ' (including archived)' : ' in the catalog'}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Toast */}
      {successNotice && (
        <div className="fixed right-6 top-6 z-[60] animate-toast-in">
          <div className={`flex items-center gap-3 overflow-hidden rounded-xl border bg-white px-5 py-4 shadow-2xl ${toastBorder}`}>
            <div className={`h-10 w-1 shrink-0 rounded-full ${toastAccent}`} />
            <div className="min-w-0">
              <div className={`text-xs font-bold uppercase tracking-wider ${toastLabel}`}>{toastTitle}</div>
              <div className="mt-0.5 text-sm text-slate-700">{successNotice}</div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice('')}
              className="ml-2 rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1a30]/70 px-4 backdrop-blur-sm"
          onClick={() => !saving && setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="animate-pop-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#1b325f]/40"
          >
            <div className="flex items-center justify-between bg-[#1b325f] px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {editing ? 'Edit Subject' : 'New Subject'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setShowForm(false)}
                className="rounded-full bg-white/10 p-1.5 text-white/80 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Subject Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-3 font-mono text-sm font-semibold uppercase text-slate-800 outline-none transition focus:border-[#1b325f] focus:bg-white focus:ring-4 focus:ring-[#1b325f]/15"
                  placeholder="IT101"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1b325f] focus:bg-white focus:ring-4 focus:ring-[#1b325f]/15"
                  placeholder="Introduction to Computing"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Year Level</label>
                <select
                  value={form.yearLevel ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, yearLevel: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1b325f] focus:bg-white focus:ring-4 focus:ring-[#1b325f]/15"
                >
                  <option value="">—</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => !saving && setShowForm(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Archive confirmation modal */}
      {pendingArchive && (() => {
        const scheduleCount = pendingArchiveUsage?.scheduleCount ?? 0;
        const instructorCount = pendingArchiveUsage?.instructorCount ?? 0;
        const willDeleteSchedules = scheduleCount > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1a30]/70 px-4 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              className="animate-pop-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-rose-900/30"
            >
              <div className={`px-6 py-4 ${willDeleteSchedules ? 'bg-rose-700' : 'bg-[#1b325f]'}`}>
                <h2 className="text-lg font-bold text-white">
                  {willDeleteSchedules ? 'Archive subject and delete schedules?' : 'Archive subject?'}
                </h2>
              </div>

              <div className="space-y-4 px-6 py-6">
                <p className="text-sm text-slate-600">
                  <span className="font-mono font-bold text-slate-800">{pendingArchive.code}</span>
                  {' — '}
                  <span className="font-semibold text-slate-800">{pendingArchive.title}</span>
                </p>

                {loadingUsage && (
                  <p className="text-sm text-slate-500">Checking…</p>
                )}

                {!loadingUsage && willDeleteSchedules && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <span className="font-bold">{scheduleCount} schedule{scheduleCount === 1 ? '' : 's'}</span>
                    {' '}will be permanently deleted with all attendance history.
                  </div>
                )}

                {!loadingUsage && instructorCount > 0 && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    {instructorCount} instructor assignment{instructorCount === 1 ? '' : 's'} will be hidden.
                  </p>
                )}

                {error && (
                  <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setPendingArchive(null);
                    setPendingArchiveUsage(null);
                    setError('');
                  }}
                  disabled={archiving}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleArchiveConfirmed()}
                  disabled={archiving || loadingUsage}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Archive className="h-4 w-4" />
                  {archiving
                    ? 'Archiving...'
                    : willDeleteSchedules
                      ? `Archive + delete ${scheduleCount} schedule${scheduleCount === 1 ? '' : 's'}`
                      : 'Archive subject'}
                </button>
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
};