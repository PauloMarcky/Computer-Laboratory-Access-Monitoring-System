import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { AdminSubNav } from '../../components/AdminComponents/AdminSubNav';
import { API_BASE_URL, readApiResponse } from '../../api';
import type { WireframeScreenId } from '../../types';

interface Kpis {
  totalRegistered: number;
  avgAttendanceRate: number;
  totalAbsences: number;
  studentsAtRisk: number;
}

interface MonthlyPoint {
  month: string;   // "YYYY-MM"
  rate: number;    // 0-100
  expected: number;
  attended: number;
}

interface SubjectAbsence {
  code: string;
  count: number;
}

interface TopAbsent {
  studentProfileId: number;
  schoolId: string;
  fullName: string;
  masked: string;
  course: string;
  yearLevel: number | null;
  absences: number;
  expected: number;
  attended: number;
  rate: number;
  severity: 'critical' | 'warning';
}

interface Overview {
  term: { id: number; academicYear: string; semester: string } | null;
  kpis: Kpis;
  monthlyAbsenceRate: MonthlyPoint[];
  subjectAbsences: SubjectAbsence[];
  topAbsentStudents: TopAbsent[];
}

interface AdminAnalyticsProps {
  token: string;
  onNavigate: (screen: WireframeScreenId) => void;
}

function monthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = Number(month) - 1;
  return `${names[idx] ?? month} ${year.slice(2)}`;
}

export const AdminStudentsAnalyticsView: React.FC<AdminAnalyticsProps> = ({
  token,
  onNavigate,
}) => {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unmaskNames, setUnmaskNames] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await readApiResponse<Overview & { error?: string }>(res);
        if (!res.ok) throw new Error(json.error || 'Unable to load analytics.');
        if (active) setData(json);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load analytics.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [token]);

  const kpis = data?.kpis;

  // Bar chart normalization — biggest bar fills the available height
  const maxSubjectAbsence = useMemo(
    () => Math.max(1, ...(data?.subjectAbsences.map((s) => s.count) ?? [1])),
    [data]
  );

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

      <div className="clams-layout">
        <AdminSubNav activeScreen="admin-students-analytics" onNavigate={onNavigate} />

        <main className="space-y-6">
          {loading && (
            <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Loading analytics…
            </section>
          )}

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </p>
          )}

          {!loading && data && (
            <>
              {data.term && (
                <p className="text-xs text-slate-500">
                  Showing data for{' '}
                  <span className="font-semibold text-slate-700">
                    {data.term.academicYear} · {data.term.semester}
                  </span>
                </p>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-xl border border-slate-200/90 p-5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Total Registered
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono tabular-nums">
                    {kpis?.totalRegistered ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 p-5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Avg Attendance Rate
                  </div>
                  <div className="text-2xl font-bold text-[#1e3a8a] mt-1.5 font-mono tabular-nums">
                    {kpis ? `${kpis.avgAttendanceRate}%` : '0%'}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 p-5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Total Absences (Sem)
                  </div>
                  <div className="text-2xl font-bold text-rose-700 mt-1.5 font-mono tabular-nums">
                    {kpis?.totalAbsences ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 p-5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Students At Risk
                  </div>
                  <div className="text-2xl font-bold text-amber-600 mt-1.5 font-mono tabular-nums">
                    {kpis?.studentsAtRisk ?? 0}
                  </div>
                </div>
              </div>

              {/* Charts + Top Absent */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left column */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Monthly Absence Rate (SVG line chart) */}
                  <section className="bg-white rounded-xl border border-slate-200/90 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-slate-900">
                        Monthly Absence Rate (%)
                      </h2>
                      {data.monthlyAbsenceRate.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          {data.monthlyAbsenceRate.length} month
                          {data.monthlyAbsenceRate.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    {data.monthlyAbsenceRate.length === 0 ? (
                      <div className="h-44 w-full flex items-center justify-center text-xs text-slate-400">
                        No attendance data yet.
                      </div>
                    ) : (
                      <MonthlyLineChart points={data.monthlyAbsenceRate} />
                    )}
                  </section>

                  {/* Total Absences by Subject Code */}
                  <section className="bg-white rounded-xl border border-slate-200/90 p-6">
                    <h2 className="text-xs font-bold text-slate-900 mb-6">
                      Total Absences by Subject Code
                    </h2>

                    {data.subjectAbsences.length === 0 ? (
                      <div className="h-44 w-full flex items-center justify-center text-xs text-slate-400">
                        No absence data yet.
                      </div>
                    ) : (
                      <>
                        <div className="h-44 flex items-end justify-around gap-4 pt-6 px-4 border-b border-slate-100">
                          {data.subjectAbsences.map((item) => (
                            <div
                              key={item.code}
                              className="flex flex-col items-center justify-end h-full w-16"
                            >
                              <span className="text-[11px] font-bold text-slate-700 font-mono tabular-nums mb-1.5">
                                {item.count}
                              </span>
                              <div
                                style={{
                                  height: `${Math.max(4, (item.count / maxSubjectAbsence) * 100)}%`,
                                }}
                                className="w-9 rounded-t-md transition-all bg-[#1b325f]"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-around gap-4 pt-2.5 px-4">
                          {data.subjectAbsences.map((item) => (
                            <div
                              key={item.code}
                              className="w-16 text-center text-[10px] font-bold text-slate-400 font-mono"
                            >
                              {item.code}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                </div>

                {/* Right column — Top absent students */}
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
                    {data.topAbsentStudents.length === 0 && (
                      <p className="text-xs text-slate-400">No student data.</p>
                    )}
                    {data.topAbsentStudents.map((st) => (
                      <div
                        key={st.studentProfileId}
                        className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {st.severity === 'critical' ? (
                            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {unmaskNames ? st.fullName : st.masked}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase">
                              {st.course}
                              {st.yearLevel != null && ` · Year ${st.yearLevel}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {st.schoolId}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono tabular-nums shrink-0 ${st.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {st.absences} Days
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
 * Inline SVG line chart for monthly absence rate.
 * No dependency — draws axis, grid, polyline, and dots.
 * -------------------------------------------------------------- */
const MonthlyLineChart: React.FC<{ points: MonthlyPoint[] }> = ({ points }) => {
  // Chart geometry
  const W = 640;
  const H = 200;
  const PAD_L = 40;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;

  // Fixed 0-100% scale (absence rate; 100% = everyone absent all the time)
  const yMax = 100;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const n = points.length;
  const stepX = n > 1 ? plotW / (n - 1) : 0;

  const xAt = (i: number) => PAD_L + (n > 1 ? i * stepX : plotW / 2);
  const yAt = (rate: number) => PAD_T + plotH - (rate / yMax) * plotH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.rate)}`)
    .join(' ');

  // Grid lines at 25, 50, 75, 100
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44" preserveAspectRatio="none">
        {/* Grid + Y labels */}
        {gridLines.map((g) => {
          const y = yAt(g);
          return (
            <g key={g}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={g === 0 ? '' : '3 3'}
              />
              <text
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="ui-monospace, monospace"
              >
                {g}%
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#1b325f"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots + X labels */}
        {points.map((p, i) => {
          const x = xAt(i);
          const y = yAt(p.rate);
          return (
            <g key={p.month}>
              <circle cx={x} cy={y} r="3.5" fill="#1b325f" />
              <circle cx={x} cy={y} r="6" fill="#1b325f" fillOpacity="0.12" />
              <text
                x={x}
                y={H - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                fontFamily="ui-monospace, monospace"
              >
                {monthLabel(p.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};