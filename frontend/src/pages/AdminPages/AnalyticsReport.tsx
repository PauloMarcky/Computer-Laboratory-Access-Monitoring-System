import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import type { WireframeScreenId } from '../../types';

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
