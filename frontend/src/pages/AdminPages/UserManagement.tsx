import React, { useEffect, useState } from 'react';
import { KeyRound, Save, UserPlus, X } from 'lucide-react';
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

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <AdminSubNav activeScreen="admin-user-management" onNavigate={onNavigate} />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-7">
        <header>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-xs text-slate-500">Add accounts and manage user passwords.</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
          >
            <h2 className="text-sm font-bold text-slate-900">Add {roleLabels[role]}</h2>

            {role !== 'CUSTODIAN' && (
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
            )}

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

            {role === 'INSTRUCTOR' && (
              <label className="block text-xs font-semibold text-slate-700">
                Department
                <input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-[#1b325f] focus:outline-none"
                  placeholder="College of Information Technology"
                />
              </label>
            )}

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
                      <th className="px-5 py-3 text-right font-semibold">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr>
                          <td className="px-5 py-3.5 font-semibold text-slate-800">{user.fullName || 'Name not on file'}</td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">{user.schoolId}</td>
                          <td className="px-5 py-3.5 text-slate-600">{roleLabels[user.role]}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button type="button" onClick={() => { setEditingPasswordId(editingPasswordId === user.id ? null : user.id); setNewPassword(''); setConfirmPassword(''); setError(''); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b325f] hover:underline">
                              <KeyRound className="h-3.5 w-3.5" />
                              Change
                            </button>
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