import React, { useState } from 'react';
import { CheckCircle2, UserPlus, Play, Square } from 'lucide-react';
import { ClamsHeader } from './ClamsHeader';
import { AttendanceEntry, WireframeScreenId } from '../types';

interface InstructorAttendanceProps {
  attendance: AttendanceEntry[];
  onScanStudent: (entry: AttendanceEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
  sessionUnlocked: boolean;
  onToggleSession: () => void;
  lastScannedName: string | null;
  onStudentLogged: (message: string) => void;
  scanner: React.ReactNode;
}

export const InstructorAttendanceView: React.FC<InstructorAttendanceProps> = ({
  attendance,
  onScanStudent,
  onNavigate,
  sessionUnlocked,
  onToggleSession,
  lastScannedName,
  onStudentLogged,
  scanner,
}) => {
  const [customId, setCustomId] = useState('');
  const [customName, setCustomName] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim() || !customName.trim()) return;
    const newEntry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      timeIn: '08:24 AM',
      studentId: customId.trim(),
      name: customName.trim(),
      formalName: customName.trim(),
      pcNumber: 'None',
      status: 'Late',
    };
    onScanStudent(newEntry);
    onStudentLogged(`${newEntry.name} (${newEntry.studentId}) logged with no PC assigned`);
    setCustomId('');
    setCustomName('');
    setShowManualEntry(false);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader
        onNavigate={onNavigate}
        statusLabel={sessionUnlocked ? 'Session Active' : 'Session Paused'}
      />

      <main className="max-w-6xl mx-auto px-6 py-7 space-y-6">
        {/* Session Status Top Bar Card */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${sessionUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
              />
              <h1 className="text-base font-bold text-slate-900">
                {sessionUnlocked ? 'Active Lab Session Unlocked' : 'Lab Session Paused'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              No active session data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSession}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${sessionUnlocked
                ? 'bg-rose-50/80 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
            >
              {sessionUnlocked ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Class</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Resume Class</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('instructor-attendance-export')}
              className="px-4 py-2 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              End Session &amp; Export Log
            </button>
          </div>
        </section>

        {/* Main Two-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Attendance Sheet (Today) */}
          <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Live Attendance Sheet (Today)</h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {attendance.length} Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 pr-3">Time</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">PC #</th>
                    <th className="py-2.5 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {attendance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {item.timeIn}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {item.studentId}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {item.pcNumber}
                      </td>
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${item.status === 'On-Time'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Column: Live Camera Scanner */}
          <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Student ID Scanner</h2>
              <button
                type="button"
                onClick={() => setShowManualEntry((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1b325f] hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showManualEntry ? 'Hide Manual Input' : 'Manual ID Input'}</span>
              </button>
            </div>

            {scanner}

            {lastScannedName && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Scanned: {lastScannedName}</span>
              </div>
            )}

            {showManualEntry && (
              <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24-10255"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#1b325f] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#1b325f]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-md bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold cursor-pointer"
                >
                  Log Student Attendance
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
