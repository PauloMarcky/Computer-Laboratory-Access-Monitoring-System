import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, KeyRound, Pencil, Save, Trash2, UserPlus, X } from 'lucide-react';
import { readSheet } from 'read-excel-file/browser';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL, readApiResponse } from '../../api';
import type { ManagedUser, ManagedUserRole, UserRole, WireframeScreenId } from '../../types';

interface UserManagementProps {
  adminToken: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  STUDENT: 'Student',
  INSTRUCTOR: 'Teacher / Instructor',
  CUSTODIAN: 'Custodian',
};

interface StudentImportRow {
  schoolId: string;
  firstName: string;
  lastName: string;
  password: string;
  course: string;
  yearLevel: number | null;
  rowNumber: number;
  errors: string[];
}

const MAX_STUDENT_IMPORT_ROWS = 100;
const normalizeHeader = (value: unknown) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const cellText = (value: unknown) => value == null ? '' : String(value).trim();

export const UserManagement: React.FC<UserManagementProps> = ({
  adminToken,
  onNavigate,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<ManagedUserRole>('STUDENT');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPasswordId, setSavingPasswordId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [savingNameId, setSavingNameId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<'manual' | 'import'>('manual');
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState<StudentImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isParsingImport, setIsParsingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importInputKey, setImportInputKey] = useState(0);

  const loadUsersFromDatabase = async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await readApiResponse<{ error?: string; users: ManagedUser[] }>(response);
    if (!response.ok) throw new Error(result.error || 'Unable to load users.');
    return result.users;
  };

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const databaseUsers = await loadUsersFromDatabase();
        if (active) setUsers(databaseUsers);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadUsers();
    return () => { active = false; };
  }, [adminToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSchoolId = schoolId.trim();
    if (users.some((user) => user.schoolId.toLowerCase() === normalizedSchoolId.toLowerCase())) {
      setError('A user with this school ID already exists.');
      return;
    }
    setIsAdding(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ schoolId: normalizedSchoolId, password, role, firstName, lastName, department }),
      });
      const result = await readApiResponse<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || 'Unable to add user.');
      setFirstName('');
      setLastName('');
      setSchoolId('');
      setPassword('');
      setDepartment('');
      setRole('STUDENT');
      setNotice(`${roleLabels[role]} account created and saved.`);
      try {
        setUsers(await loadUsersFromDatabase());
      } catch {
        setError('The account was saved, but the user list could not be refreshed. Reload this page.');
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to add user.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportRows([]);
    setImportErrors([]);
    setError('');
    setNotice('');
    setIsParsingImport(true);

    try {
      const sheet = await readSheet(file);
      if (sheet.length < 2) {
        setImportErrors(['The workbook needs a header row and at least one student row.']);
        return;
      }

      const headers = sheet[0].map(normalizeHeader);
      const findColumn = (...names: string[]) => headers.findIndex((header) => names.includes(header));
      const columns = {
        schoolId: findColumn('schoolid', 'studentid'),
        firstName: findColumn('firstname', 'givenname'),
        lastName: findColumn('lastname', 'familyname'),
        password: findColumn('initialpassword', 'password'),
        course: findColumn('course', 'program'),
        yearLevel: findColumn('yearlevel', 'year'),
      };
      const requiredColumns = ['schoolId', 'firstName', 'lastName', 'password', 'course', 'yearLevel'] as const;
      const missingColumns = requiredColumns.filter((column) => columns[column] < 0);
      if (missingColumns.length) {
        setImportErrors([`Missing required columns: ${missingColumns.join(', ')}.`]);
        return;
      }

      const dataRows = sheet.slice(1).filter((row) => row.some((cell) => cellText(cell) !== ''));
      if (!dataRows.length) {
        setImportErrors(['The spreadsheet has no student rows.']);
        return;
      }
      if (dataRows.length > MAX_STUDENT_IMPORT_ROWS) {
        setImportErrors([`Import no more than ${MAX_STUDENT_IMPORT_ROWS} students at a time.`]);
        return;
      }

      const knownSchoolIds = new Set(users.map((user) => user.schoolId.toLowerCase()));
      const seenSchoolIds = new Set<string>();
      const preview = dataRows.map((row, index): StudentImportRow => {
        const schoolId = cellText(row[columns.schoolId]);
        const firstName = cellText(row[columns.firstName]);
        const lastName = cellText(row[columns.lastName]);
        const password = cellText(row[columns.password]);
        const course = columns.course < 0 ? '' : cellText(row[columns.course]);
        const yearText = columns.yearLevel < 0 ? '' : cellText(row[columns.yearLevel]);
        const yearLevel = yearText ? Number(yearText) : null;
        const errors: string[] = [];
        const normalizedId = schoolId.toLowerCase();

        if (!schoolId) errors.push('Missing school ID');
        else if (knownSchoolIds.has(normalizedId)) errors.push('School ID already exists');
        else if (seenSchoolIds.has(normalizedId)) errors.push('Duplicate school ID in file');
        if (!firstName) errors.push('Missing first name');
        if (!lastName) errors.push('Missing last name');
        if (password.length < 8) errors.push('Password must be at least 8 characters');
        if (!course) errors.push('Missing course');
        if (!yearText) errors.push('Missing year level');
        else if (!Number.isInteger(yearLevel) || yearLevel! < 1 || yearLevel! > 4) {
          errors.push('Year level must be 1 to 4');
        }
        if (normalizedId) seenSchoolIds.add(normalizedId);

        return { schoolId, firstName, lastName, password, course, yearLevel, rowNumber: index + 2, errors };
      });
      setImportRows(preview);
    } catch (parseError) {
      setImportErrors([parseError instanceof Error ? parseError.message : 'Unable to read this Excel file.']);
    } finally {
      setIsParsingImport(false);
    }
  };

  const handleImportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importRows.length || importRows.some((row) => row.errors.length)) return;
    setIsImporting(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/import/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          students: importRows.map(({ schoolId, firstName, lastName, password, course, yearLevel }) => ({
            schoolId, firstName, lastName, password, course, yearLevel,
          })),
        }),
      });
      const result = await readApiResponse<{
        error?: string;
        details?: string[];
        schoolIds?: string[];
        created?: number;
      }>(response);
      if (!response.ok) {
        const details = result.details?.join(' ') || result.schoolIds?.join(', ');
        throw new Error(details ? `${result.error} ${details}` : result.error || 'Unable to import students.');
      }

      setImportRows([]);
      setImportFileName('');
      setImportInputKey((key) => key + 1);
      setNotice(`${result.created ?? 0} student accounts imported.`);
      setUsers(await loadUsersFromDatabase());
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Unable to import students.');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePasswordUpdate = async (userId: number) => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setSavingPasswordId(userId);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const result = await readApiResponse<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || 'Unable to update password.');
      setNotice(`Password updated for ${users.find((user) => user.id === userId)?.schoolId}.`);
      setEditingPasswordId(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update password.');
    } finally {
      setSavingPasswordId(null);
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    const relatedDataWarning = user.role === 'STUDENT'
      ? 'Their enrollments, attendance, PC occupancy, and reported PC issues will also be deleted.'
      : user.role === 'INSTRUCTOR'
        ? 'Their schedules, sessions, enrollments, attendance, and related PC records will also be deleted.'
        : user.role === 'CUSTODIAN'
          ? 'Their custodian profile will be deleted. Existing PC issue reports will remain without an assigned handler.'
          : 'This administrator account will be permanently removed.';
    const confirmed = window.confirm(
      `Delete ${roleLabels[user.role].toLowerCase()} ${user.schoolId}? ${relatedDataWarning} This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const result = await readApiResponse<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error || 'Unable to delete user.');
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingPasswordId === user.id) {
        setEditingPasswordId(null);
        setNewPassword('');
        setConfirmPassword('');
      }
      setNotice(`${roleLabels[user.role]} account ${user.schoolId} deleted.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const beginNameEdit = (user: ManagedUser) => {
    setEditingNameId(user.id);
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditingPasswordId(null);
    setError('');
    setNotice('');
  };

  const cancelNameEdit = () => {
    setEditingNameId(null);
    setEditFirstName('');
    setEditLastName('');
  };

  const handleNameUpdate = async (userId: number) => {
    const first = editFirstName.trim();
    const last = editLastName.trim();
    if (!first || !last) {
      setError('First and last names are required.');
      return;
    }

    setSavingNameId(userId);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ firstName: first, lastName: last }),
      });
      const result = await readApiResponse<{
        error?: string;
        user: { firstName: string; lastName: string; fullName: string };
      }>(response);
      if (!response.ok) throw new Error(result.error || 'Unable to update user name.');
      setUsers((current) => current.map((user) => user.id === userId
        ? { ...user, ...result.user }
        : user));
      setNotice(`Name updated for ${users.find((user) => user.id === userId)?.schoolId}.`);
      cancelNameEdit();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update user name.');
    } finally {
      setSavingNameId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-user-management" onNavigate={onNavigate} />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-7">
        <header>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-xs text-slate-500">Add accounts, manage passwords, and remove user accounts.</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
          <form
            onSubmit={formMode === 'manual' ? handleSubmit : handleImportSubmit}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="User creation method">
              <button
                type="button"
                role="tab"
                aria-selected={formMode === 'manual'}
                onClick={() => { setFormMode('manual'); setError(''); }}
                className={`rounded px-2 py-2 text-xs font-semibold ${formMode === 'manual' ? 'bg-white text-[#1b325f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Add One
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={formMode === 'import'}
                onClick={() => { setFormMode('import'); setError(''); }}
                className={`inline-flex items-center justify-center gap-1.5 rounded px-2 py-2 text-xs font-semibold ${formMode === 'import' ? 'bg-white text-[#1b325f] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Import Excel
              </button>
            </div>

            {formMode === 'manual' ? (
              <>
                <h2 className="text-sm font-bold text-slate-900">Add {roleLabels[role]}</h2>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    First name
                    <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Last name
                    <input required value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none" />
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-700">
                  School ID
                  <input
                    required
                    value={schoolId}
                    onChange={(event) => {
                      setSchoolId(event.target.value);
                      setError('');
                    }}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none"
                    placeholder="Enter school ID"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  Role
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as ManagedUserRole)}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="CUSTODIAN">Custodian</option>
                  </select>
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  Initial password
                  <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none" />
                </label>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1b325f] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#142547] disabled:cursor-wait disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {isAdding ? 'Saving...' : `Add ${roleLabels[role]}`}
                </button>
              </>
            ) : (
              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Import Student Accounts</h2>
                  <p className="mt-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
                    Student accounts only. This import does not create instructor, custodian, or administrator accounts.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Upload an .xlsx workbook with School ID, First Name, Last Name, Initial Password, Course, and Year Level columns. Year Level must be 1 to 4. Format IDs and passwords as text to preserve leading zeroes.
                  </p>
                </div>

                <label className="block text-xs font-semibold text-slate-700">
                  Excel workbook (.xlsx)
                  <input
                    key={importInputKey}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(event) => void handleImportFile(event.target.files?.[0])}
                    className="mt-1.5 block w-full rounded-md border border-slate-300 bg-white text-xs text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  />
                </label>

                {importFileName && <p className="text-xs text-slate-600">Selected: {importFileName}</p>}
                {isParsingImport && <p className="text-xs text-slate-500">Reading workbook...</p>}
                {importErrors.map((message) => (
                  <p key={message} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{message}</p>
                ))}

                {importRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Preview ({importRows.length} rows)</span>
                      <span className={importRows.some((row) => row.errors.length) ? 'text-rose-700' : 'text-emerald-700'}>
                        {importRows.filter((row) => !row.errors.length).length} ready
                      </span>
                    </div>
                    <div className="max-h-64 overflow-auto rounded-md border border-slate-200">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-2 py-2">Row</th>
                            <th className="px-2 py-2">School ID</th>
                            <th className="px-2 py-2">Student</th>
                            <th className="px-2 py-2">Course / Year</th>
                            <th className="px-2 py-2">Validation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importRows.map((row) => (
                            <tr key={`${row.rowNumber}-${row.schoolId}`}>
                              <td className="px-2 py-2 font-mono">{row.rowNumber}</td>
                              <td className="px-2 py-2 font-mono">{row.schoolId || '—'}</td>
                              <td className="px-2 py-2">{`${row.firstName} ${row.lastName}`.trim() || '—'}</td>
                              <td className="px-2 py-2">{[row.course, row.yearLevel ? `Year ${row.yearLevel}` : ''].filter(Boolean).join(' · ') || '—'}</td>
                              <td className={`px-2 py-2 ${row.errors.length ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {row.errors.join('; ') || 'Ready'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isImporting || isParsingImport || !importRows.length || importRows.some((row) => row.errors.length > 0)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1b325f] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#142547] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {isImporting ? 'Importing...' : `Import ${importRows.length} Students`}
                </button>
              </section>
            )}
          </form>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Users</h2>
                <p className="mt-1 text-xs text-slate-500">{users.length} accounts</p>
              </div>
            </div>

            {isLoading ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">School ID</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr>
                          <td className="px-5 py-3.5 font-semibold text-slate-800">
                            {editingNameId === user.id ? (
                              <div className="grid gap-2 sm:grid-cols-2">
                                <input
                                  aria-label={`First name for ${user.schoolId}`}
                                  value={editFirstName}
                                  onChange={(event) => setEditFirstName(event.target.value)}
                                  maxLength={191}
                                  className="min-w-0 rounded border border-slate-300 px-2 py-1.5 font-normal focus:border-[#1b325f] focus:outline-none"
                                />
                                <input
                                  aria-label={`Last name for ${user.schoolId}`}
                                  value={editLastName}
                                  onChange={(event) => setEditLastName(event.target.value)}
                                  maxLength={191}
                                  className="min-w-0 rounded border border-slate-300 px-2 py-1.5 font-normal focus:border-[#1b325f] focus:outline-none"
                                />
                              </div>
                            ) : user.isCurrentUser ? 'Current administrator' : user.fullName || 'Name not on file'}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">{user.schoolId}</td>
                          <td className="px-5 py-3.5 text-slate-600">{roleLabels[user.role]}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-3">
                              {editingNameId === user.id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void handleNameUpdate(user.id)}
                                    disabled={savingNameId === user.id}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                    {savingNameId === user.id ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelNameEdit}
                                    disabled={savingNameId === user.id}
                                    aria-label={`Cancel name edit for ${user.schoolId}`}
                                    className="inline-flex items-center text-slate-500 hover:text-slate-800 disabled:opacity-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!user.isCurrentUser && user.role !== 'ADMIN' && (
                                    <button
                                      type="button"
                                      onClick={() => beginNameEdit(user)}
                                      aria-label={`Edit name for ${user.schoolId}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b325f] hover:underline"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit Name
                                    </button>
                                  )}
                                  <button type="button" onClick={() => { setEditingPasswordId(editingPasswordId === user.id ? null : user.id); setNewPassword(''); setConfirmPassword(''); setError(''); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b325f] hover:underline">
                                    <KeyRound className="h-3.5 w-3.5" />
                                    Change
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteUser(user)}
                                    disabled={user.isCurrentUser || deletingUserId === user.id}
                                    title={user.isCurrentUser ? 'You cannot delete the signed-in administrator' : 'Delete user account'}
                                    aria-label={`Delete ${user.schoolId}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {editingPasswordId === user.id && (
                          <tr>
                            <td colSpan={4} className="bg-slate-50 px-5 py-4">
                              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                                <label className="block text-xs font-semibold text-slate-700">New password<input type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal focus:border-[#1b325f] focus:outline-none" /></label>
                                <label className="block text-xs font-semibold text-slate-700">Confirm password<input type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal focus:border-[#1b325f] focus:outline-none" /></label>
                                <button type="button" onClick={() => void handlePasswordUpdate(user.id)} disabled={savingPasswordId === user.id || !newPassword || !confirmPassword} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-3.5 w-3.5" />{savingPasswordId === user.id ? 'Saving...' : 'Save'}</button>
                                <button type="button" onClick={() => { setEditingPasswordId(null); setNewPassword(''); setConfirmPassword(''); }} className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-white" aria-label="Cancel password change"><X className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};