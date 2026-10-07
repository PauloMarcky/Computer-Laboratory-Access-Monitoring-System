import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Printer, Search, X } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { LabStaffSubNav } from '../../components/CustodianComponents/LabStaffSubNav';
import { formatSchoolDate } from '../../utils/attendance-time';
import type { LabUsageRecord, WireframeScreenId } from '../../types';

interface LabStaffUsageHistoryProps {
  records: LabUsageRecord[];
  onNavigate: (screen: WireframeScreenId) => void;
}

/* ---------------- date helpers (all values are "YYYY-MM-DD") ---------------- */

const pad = (value: number) => String(value).padStart(2, '0');
const toYmd = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseYmd = (ymd: string) => {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const weekRange = (ymd: string): [string, string] => {
  const date = parseYmd(ymd);
  const sinceMonday = (date.getDay() + 6) % 7;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - sinceMonday);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return [toYmd(start), toYmd(end)];
};
const monthRange = (ymd: string): [string, string] => {
  const date = parseYmd(ymd);
  return [
    toYmd(new Date(date.getFullYear(), date.getMonth(), 1)),
    toYmd(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  ];
};
const prettyDate = (ymd: string) =>
  parseYmd(ymd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const PAGE_SIZE = 8;

export const LabStaffUsageHistoryView: React.FC<LabStaffUsageHistoryProps> = ({ records, onNavigate }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [labFilter, setLabFilter] = useState('All Laboratories');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const invalidRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records
      .filter((record) => {
        const matchesFrom = !dateFrom || record.date >= dateFrom;
        const matchesTo = !dateTo || record.date <= dateTo;
        const matchesLab = labFilter === 'All Laboratories' || record.laboratory === labFilter;
        const matchesSearch = !query
          || record.subject.toLowerCase().includes(query)
          || record.subjectName.toLowerCase().includes(query)
          || record.instructor.toLowerCase().includes(query)
          || record.section.toLowerCase().includes(query)
          || record.laboratory.toLowerCase().includes(query);
        return matchesFrom && matchesTo && matchesLab && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, dateFrom, dateTo, labFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, labFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const displayedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalAttendanceEntries = filteredRecords.reduce((sum, record) => sum + record.students.length, 0);

  const applyPreset = (preset: 'today' | 'week' | 'month' | 'all') => {
    const today = formatSchoolDate(new Date());
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'today') {
      setDateFrom(today);
      setDateTo(today);
    } else {
      const [start, end] = preset === 'week' ? weekRange(today) : monthRange(today);
      setDateFrom(start);
      setDateTo(end);
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setLabFilter('All Laboratories');
    setSearchQuery('');
  };

  const periodLabel = dateFrom || dateTo
    ? `${dateFrom ? prettyDate(dateFrom) : 'Earliest record'} to ${dateTo ? prettyDate(dateTo) : 'Latest record'}`
    : 'All dates';

  const handlePrint = () => {
    const previousTitle = document.title;
    document.title = `Laboratory Usage Report - ${periodLabel}`;
    window.print();
    document.title = previousTitle;
  };

  const inputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#1b325f] focus:outline-none';
  const presetClass =
    'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer';

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9] print:min-h-0 print:bg-white">
      <style>{'@page { size: A4; margin: 12mm; }'}</style>
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-usage-history" onNavigate={onNavigate} />

      {/* ================= SCREEN VIEW ================= */}
      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5 print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Laboratory Usages</h1>
            <p className="mt-1 text-xs text-slate-500">
              History of all completed class sessions. Filter by date, then print the full record including every student.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            disabled={filteredRecords.length === 0 || invalidRange}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1b325f] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#142547] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </button>
        </div>

        {/* Filters */}
        <section className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block text-[11px] font-semibold text-slate-500">
              From
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className={`mt-1 block ${inputClass}`}
              />
            </label>
            <label className="block text-[11px] font-semibold text-slate-500">
              To
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className={`mt-1 block ${inputClass}`}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => applyPreset('today')} className={presetClass}>Today</button>
              <button type="button" onClick={() => applyPreset('week')} className={presetClass}>This Week</button>
              <button type="button" onClick={() => applyPreset('month')} className={presetClass}>This Month</button>
              <button type="button" onClick={() => applyPreset('all')} className={presetClass}>All Dates</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by subject, instructor, section or room..."
                className={`w-full pl-8 ${inputClass}`}
              />
            </div>
            <select
              value={labFilter}
              onChange={(event) => setLabFilter(event.target.value)}
              className={`${inputClass} font-medium cursor-pointer`}
            >
              <option value="All Laboratories">All Laboratories</option>
              {[...new Set(records.map((record) => record.laboratory))].map((laboratory) => (
                <option key={laboratory} value={laboratory}>{laboratory}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear filters
            </button>
          </div>

          {invalidRange && (
            <p role="alert" className="text-xs font-medium text-rose-700">
              The start date is after the end date. Adjust the range to see records.
            </p>
          )}
        </section>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period</div>
            <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-slate-900">
              <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>{periodLabel}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Classes</div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-slate-900">{filteredRecords.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Attendance Entries</div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-slate-900">{totalAttendanceEntries}</div>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">Laboratory</th>
                  <th className="px-4 py-3.5">Session Time</th>
                  <th className="px-4 py-3.5">Instructor</th>
                  <th className="px-4 py-3.5">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      {records.length === 0
                        ? 'No completed classes yet.'
                        : 'No completed classes match these filters.'}
                    </td>
                  </tr>
                )}
                {displayedRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">{record.date}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          aria-expanded={expandedId === record.id}
                          onClick={() => setExpandedId((current) => (current === record.id ? null : record.id))}
                          className="flex items-center gap-2 text-left cursor-pointer"
                        >
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`}
                          />
                          <span>
                            <span className="block font-bold text-[#1b325f]">{record.subject}</span>
                            <span className="block text-[10px] font-medium text-slate-500">
                              {record.subjectName} · Section {record.section} · Year {record.yearLevel}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">{record.laboratory}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-mono tabular-nums text-slate-500">{record.timeslot}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.instructor}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {record.studentsPresent} / {record.studentsTotal} present
                      </td>
                    </tr>
                    {expandedId === record.id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-6 py-4">
                          {record.students.length === 0 ? (
                            <p className="py-3 text-center text-xs text-slate-500">
                              No student attendance recorded for this class.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                                  <tr>
                                    <th className="px-3 py-2.5">#</th>
                                    <th className="px-3 py-2.5">Student</th>
                                    <th className="px-3 py-2.5">School ID</th>
                                    <th className="px-3 py-2.5">Time In</th>
                                    <th className="px-3 py-2.5">Time Out</th>
                                    <th className="px-3 py-2.5">PC</th>
                                    <th className="px-3 py-2.5">Attendance</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {record.students.map((student, index) => (
                                    <tr key={student.id}>
                                      <td className="px-3 py-2.5 font-mono text-slate-400">{index + 1}</td>
                                      <td className="px-3 py-2.5 font-semibold text-slate-800">{student.formalName || student.name}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.studentId}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.timeIn}</td>
                                      <td className="px-3 py-2.5 font-mono text-slate-600">{student.timeOut || 'Not recorded'}</td>
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

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-3.5 text-xs text-slate-500">
            <span>
              Showing {displayedRecords.length} of {filteredRecords.length} classes
            </span>
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              <span className="px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= PRINT VIEW (all filtered records, every student) ================= */}
      <div className="hidden px-1 text-[11px] text-black print:block">
        <header className="mb-4 border-b-2 border-black pb-2 text-center">
          <h1 className="text-base font-bold uppercase tracking-wide">University of La Salette, Inc.</h1>
          <p className="text-[10px]">Santiago City, Isabela</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider">Computer Laboratory Usage Report</p>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-1">
          <div><span className="font-bold">Period:</span> {periodLabel}</div>
          <div className="text-right"><span className="font-bold">Printed:</span> {new Date().toLocaleString()}</div>
          <div><span className="font-bold">Laboratory:</span> {labFilter}</div>
          <div className="text-right">
            <span className="font-bold">Total classes:</span> {filteredRecords.length}
            {' · '}
            <span className="font-bold">Attendance entries:</span> {totalAttendanceEntries}
          </div>
        </div>

        {filteredRecords.map((record, recordIndex) => (
          <section key={record.id} className="mb-6">
            <div className="break-after-avoid">
              <div className="bg-slate-200 px-2 py-1 font-bold">
                {recordIndex + 1}. {record.subject} - {record.subjectName}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 border-x border-b border-slate-400 px-2 py-1.5">
                <div><span className="font-bold">Date:</span> {record.date}</div>
                <div><span className="font-bold">Session Time:</span> {record.timeslot}</div>
                <div><span className="font-bold">Laboratory:</span> {record.laboratory}</div>
                <div><span className="font-bold">Instructor:</span> {record.instructor}</div>
                <div><span className="font-bold">Section / Year:</span> {record.section} / {record.yearLevel}</div>
                <div>
                  <span className="font-bold">Term:</span>{' '}
                  {[record.academicYear, record.semester].filter(Boolean).join(' ') || 'Not specified'}
                </div>
                <div className="col-span-2">
                  <span className="font-bold">Attendance:</span> {record.studentsPresent} of {record.studentsTotal} enrolled students present
                </div>
              </div>
            </div>

            {record.students.length === 0 ? (
              <p className="border-x border-b border-slate-400 px-2 py-2 italic">No student attendance recorded.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-1.5 py-1 w-7">#</th>
                    <th className="border border-slate-400 px-1.5 py-1">Student Name</th>
                    <th className="border border-slate-400 px-1.5 py-1">School ID</th>
                    <th className="border border-slate-400 px-1.5 py-1">Time In</th>
                    <th className="border border-slate-400 px-1.5 py-1">Time Out</th>
                    <th className="border border-slate-400 px-1.5 py-1">PC</th>
                    <th className="border border-slate-400 px-1.5 py-1">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {record.students.map((student, index) => (
                    <tr key={student.id} className="break-inside-avoid">
                      <td className="border border-slate-400 px-1.5 py-0.5">{index + 1}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.formalName || student.name}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.studentId}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.timeIn}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.timeOut || 'Not recorded'}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.pcNumber}</td>
                      <td className="border border-slate-400 px-1.5 py-0.5">{student.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}

        <div className="mt-12 grid grid-cols-2 gap-12 break-inside-avoid text-center">
          <div>
            <div className="border-t border-black pt-1 font-bold">Laboratory Custodian</div>
            <div className="text-[10px]">Prepared by / Date</div>
          </div>
          <div>
            <div className="border-t border-black pt-1 font-bold">Dean of IT</div>
            <div className="text-[10px]">Noted by / Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};