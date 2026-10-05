import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL, readApiResponse } from '../../api';
import type { WireframeScreenId } from '../../types';

interface Subject {
  id: number;
  code: string;
  title: string;
  yearLevel: number | null;
}

interface Props {
  token: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

export const SubjectManagerView: React.FC<Props> = ({ token, onNavigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', yearLevel: 1 as number | null });
  const [saving, setSaving] = useState(false);
  const [pendingDeleteSubject, setPendingDeleteSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse<{ subjects: Subject[] }>(res);
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', title: '', yearLevel: 1 });
    setShowForm(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ code: s.code, title: s.title, yearLevel: s.yearLevel ?? null });
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject: Subject) => {
    setDeletingSubjectId(subject.id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/subjects/${subject.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Unable to delete subject.');
      setSubjects((prev) => prev.filter((item) => item.id !== subject.id));
      setPendingDeleteSubject(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete subject.');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-subjects" onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Subject Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage the subject catalog used when creating schedules.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </button>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 text-left">
              <tr>
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Year Level</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading...</td></tr>
              ) : subjects.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No subjects yet.</td></tr>
              ) : subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-5 font-mono font-semibold text-slate-800">{s.code}</td>
                  <td className="py-3 px-4 text-slate-700">{s.title}</td>
                  <td className="py-3 px-4 text-slate-600">{s.yearLevel ?? '—'}</td>
                  <td className="py-3 px-5 text-right">
                    <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-slate-100 rounded cursor-pointer"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button onClick={() => { setPendingDeleteSubject(s); setError(''); }} aria-label={`Delete subject ${s.code}`} className="p-1.5 hover:bg-rose-50 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">{editing ? 'Edit Subject' : 'New Subject'}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm uppercase" placeholder="IT101" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="Introduction to Computing" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Year Level</label>
                <select value={form.yearLevel ?? ''} onChange={(e) => setForm({ ...form, yearLevel: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">—</option>
                  {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {pendingDeleteSubject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-subject-title" aria-describedby="delete-subject-description" className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
              <h2 id="delete-subject-title" className="text-base font-bold text-slate-900">Delete subject {pendingDeleteSubject.code}?</h2>
              <p id="delete-subject-description" className="mt-2 text-sm leading-6 text-slate-600">This will permanently remove {pendingDeleteSubject.title} from the subject catalog.</p>
              {error && <p role="alert" className="mt-3 text-xs font-medium text-rose-700">{error}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => { setPendingDeleteSubject(null); setError(''); }} disabled={deletingSubjectId === pendingDeleteSubject.id} className="rounded-md border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="button" onClick={() => void handleDelete(pendingDeleteSubject)} disabled={deletingSubjectId === pendingDeleteSubject.id} className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {deletingSubjectId === pendingDeleteSubject.id ? 'Deleting...' : 'Delete subject'}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};