import React, { useState } from 'react';
import {
  ChevronLeft,
  Printer,
  Download,
  Search,
  Monitor,
  CheckCircle2,
  Wrench,
  BookOpen,
  User,
  Clock,
  Users,
} from 'lucide-react';
import { ClamsHeader } from './ClamsHeader';
import {
  AttendanceEntry,
  ClassReportSubmission,
  LabRoomStatus,
  LabUsageRecord,
  WireframeScreenId,
} from '../types';

interface LabStaffSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

const LabStaffSubNav: React.FC<LabStaffSubNavProps> = ({ activeScreen, onNavigate }) => {
  const isReports = activeScreen === 'lab-staff-report-detail';
  const isActivity =
    activeScreen === 'lab-staff-records-module' || activeScreen === 'lab-staff-rooms-module';
  const isExport = activeScreen === 'lab-staff-report-export';

  return (
    <div className="bg-white border-b border-slate-200 px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onNavigate('lab-staff-report-detail')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isReports
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Reports
          </button>

          <button
            type="button"
            onClick={() => onNavigate('lab-staff-records-module')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isActivity
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Lab Activity
          </button>

          <button
            type="button"
            onClick={() => onNavigate('lab-staff-report-export')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isExport
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Export
          </button>
        </nav>

        {isActivity && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg my-1.5">
            <button
              type="button"
              onClick={() => onNavigate('lab-staff-records-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'lab-staff-records-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Usage Records
            </button>
            <button
              type="button"
              onClick={() => onNavigate('lab-staff-rooms-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'lab-staff-rooms-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Lab Rooms Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface LabStaffReportDetailProps {
  selectedReport?: ClassReportSubmission;
  onUpdateReportStatus: (
    reportId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    remarks: string
  ) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffReportDetailView: React.FC<LabStaffReportDetailProps> = ({
  selectedReport,
  onUpdateReportStatus,
  onNavigate,
}) => {
  const [remarks, setRemarks] = useState(selectedReport?.remarks || '');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const handleDecision = (newStatus: 'Approved' | 'Rejected') => {
    if (!selectedReport) return;
    onUpdateReportStatus(selectedReport.id, newStatus, remarks);
    setFeedbackBanner(
      newStatus === 'Approved'
        ? 'Report verified and approved. Official export document updated.'
        : 'Report marked as rejected and returned to instructor for correction.'
    );
  };

  if (!selectedReport) {
    return (
      <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
        <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
        <LabStaffSubNav activeScreen="lab-staff-report-detail" onNavigate={onNavigate} />
        <main className="max-w-7xl mx-auto px-6 py-7">
          <p className="text-sm text-slate-500">No report selected.</p>
        </main>
      </div>
    );
  }

  const statusDisplay =
    selectedReport.status === 'Pending'
      ? {
        label: 'Pending Review',
        className: 'bg-amber-50 text-amber-800 border border-amber-200',
      }
      : selectedReport.status === 'Approved'
        ? {
          label: 'Approved',
          className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        }
        : {
          label: 'Rejected',
          className: 'bg-rose-50 text-rose-800 border border-rose-200',
        };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-report-detail" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">
        {/* Title & Back Action */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">PC Report Details</h1>
              <p className="text-xs text-slate-500">
                Viewing record {selectedReport.subjectCode} Class Session Log for verification.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('lab-staff-report-export')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            Open Export View
          </button>
        </div>

        {/* Metadata Info Card */}
        <section className="bg-white rounded-xl border border-slate-200/90 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <div>
              <span className="font-bold text-slate-800">Subject Code:</span>{' '}
              <span className="text-slate-600">
                {selectedReport.subjectCode} ({selectedReport.subjectName})
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Lab Room:</span>{' '}
              <span className="text-slate-600">{selectedReport.labRoom}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Instructor Name:</span>{' '}
              <span className="text-slate-600">{selectedReport.instructor}</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <div>
              <span className="font-bold text-slate-800">Date:</span>{' '}
              <span className="text-slate-600">{selectedReport.date}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Session Time:</span>{' '}
              <span className="text-slate-600 font-mono tabular-nums">
                {selectedReport.sessionTime}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Semester:</span>{' '}
              <span className="text-slate-600">{selectedReport.semester}</span>
            </div>
          </div>
        </section>

        {/* Bottom Split: Attendance Table + Approval Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table */}
          <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Time In</th>
                    <th className="py-3 px-4">PC #</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReport.attendanceList.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                        {entry.studentId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {entry.formalName}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                        {entry.timeIn}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                        {entry.pcNumber}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${entry.status === 'On-Time'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Approval Panel */}
          <section className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Approval Panel</h2>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium">Current Status</span>
              <span className={`px-2.5 py-0.5 rounded font-semibold text-[11px] ${statusDisplay.className}`}>
                {statusDisplay.label}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Record any verification or rejection notes..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b325f] resize-none"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDecision('Approved')}
                className="w-full py-2.5 px-4 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Approve Report
              </button>

              <button
                type="button"
                onClick={() => handleDecision('Rejected')}
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reject Report
              </button>
            </div>

            {feedbackBanner && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                {feedbackBanner}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

interface LabStaffExportProps {
  attendance: AttendanceEntry[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffReportExportView: React.FC<LabStaffExportProps> = ({
  attendance,
  onNavigate,
}) => {
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  const handleExportPdf = () => {
    setDownloadedNotice(true);
    setTimeout(() => setDownloadedNotice(false), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#e2e8f0]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-report-export" onNavigate={onNavigate} />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 no-print">
          <h1 className="text-sm font-bold text-slate-800">Official Document Export View</h1>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export as PDF</span>
            </button>
          </div>
        </div>

        {downloadedNotice && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between no-print">
            <span>
              Attendance log is ready to print or export.
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="font-semibold underline cursor-pointer"
            >
              Open Print Dialog
            </button>
          </div>
        )}

        {/* Paper Sheet Container */}
        <div className="bg-white rounded-md shadow-sm border border-slate-300 px-8 py-10">
          {/* University Header */}
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-5">
            <h2 className="text-base font-bold tracking-wide text-slate-900 uppercase">
              UNIVERSITY OF LA SALETTE, INC.
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Santiago City, Isabela</p>
            <p className="text-[11px] font-bold tracking-wider text-slate-800 uppercase mt-2.5">
              COLLEGE OF INFORMATION TECHNOLOGY — COMPUTER LAB ATTENDANCE LOG
            </p>
          </div>

          {/* Session Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-800 mb-5">
            <div className="space-y-1">
              <div>
                <span className="font-bold">Subject Code:</span> —
              </div>
              <div>
                <span className="font-bold">Laboratory Room:</span> —
              </div>
              <div>
                <span className="font-bold">Instructor Name:</span> —
              </div>
            </div>
            <div className="space-y-1 sm:text-right">
              <div>
                <span className="font-bold">Date:</span> —
              </div>
              <div>
                <span className="font-bold">Scheduled Time:</span> —
              </div>
              <div>
                <span className="font-bold">Session Start / End:</span> —
              </div>
            </div>
          </div>

          {/* 5-Row Formal Table */}
          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1b325f] text-white font-semibold">
                  <th className="py-2.5 px-3 border-r border-slate-600/40 w-10">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-600/40">Student ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-600/40">Full Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-600/40">Time In</th>
                  <th className="py-2.5 px-3 border-r border-slate-600/40">PC #</th>
                  <th className="py-2.5 px-3 border-r border-slate-600/40">Status</th>
                  <th className="py-2.5 px-3 w-36">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {attendance.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-600">
                      {row.studentId}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-900">
                      {row.formalName}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-700">
                      {row.timeIn}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-700">
                      {row.pcNumber}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-semibold text-slate-800">
                      {row.status}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="border-b border-slate-300 h-4 w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Three-Column Signature Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-14 pt-4 text-center text-xs">
            <div>
              <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">
                —
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Laboratory Staff / Verifier
              </div>
            </div>

            <div>
              <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">
                —
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Class Instructor Signature &amp; Date
              </div>
            </div>

            <div>
              <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">
                —
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Dean of IT / Approver
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface LabStaffRecordsProps {
  records: LabUsageRecord[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffRecordsView: React.FC<LabStaffRecordsProps> = ({
  records,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [labFilter, setLabFilter] = useState('All Laboratories');
  const [ayFilter, setAyFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      !searchQuery.trim() ||
      rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLab = labFilter === 'All Laboratories' || rec.laboratory === labFilter;
    const matchesAy = !ayFilter || rec.academicYear === ayFilter;
    const matchesSem = !semFilter || rec.semester === semFilter;
    return matchesSearch && matchesLab && matchesAy && matchesSem;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const displayedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Timeslot',
      'Laboratory',
      'Subject',
      'Instructor',
      'Section',
      'Year Level',
      'Status',
    ];
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((r) =>
        [
          `"${r.date}"`,
          `"${r.timeslot}"`,
          `"${r.laboratory}"`,
          `"${r.subject}"`,
          `"${r.instructor}"`,
          `"${r.section}"`,
          `"${r.yearLevel}"`,
          `"${r.status}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clams-lab-usage-records.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader
        onNavigate={onNavigate}
        statusLabel="Computer Laboratory System"
      />
      <LabStaffSubNav activeScreen="lab-staff-records-module" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Lab Usage Records</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and audit historical computer laboratory usage and session tracking logs.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 font-mono tabular-nums">
            Total: {records.length} Records
          </div>
        </div>

        {/* Filters & Export Bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by subject or instructor..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b325f]"
              />
            </div>

            <select
              value={labFilter}
              onChange={(e) => {
                setLabFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="All Laboratories">All Laboratories</option>
              {[...new Set(records.map((record) => record.laboratory))].map((laboratory) => (
                <option key={laboratory} value={laboratory}>{laboratory}</option>
              ))}
            </select>

            <select
              value={ayFilter}
              onChange={(e) => setAyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="">All Academic Years</option>
              {[...new Set(records.map((record) => record.academicYear))].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="">All Semesters</option>
              {[...new Set(records.map((record) => record.semester))].map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Records</span>
          </button>
        </section>

        {/* Data Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Timeslot</th>
                  <th className="py-3.5 px-4">Laboratory</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Year Level</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No usage records.
                    </td>
                  </tr>
                )}
                {displayedRecords.map((rec) => {
                  const statusStyle =
                    rec.status === 'ONGOING'
                      ? 'bg-blue-50 text-blue-700'
                      : rec.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {rec.timeslot}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rec.laboratory}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1b325f] whitespace-nowrap">
                        {rec.subject}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {rec.instructor}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {rec.section}
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {rec.yearLevel}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${statusStyle}`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-bold text-slate-800">
                {filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </span>{' '}of{' '}
              <span className="font-bold text-slate-800">{filteredRecords.length}</span> records
            </div>

            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                &larr; Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${currentPage === page
                    ? 'bg-[#1b325f] text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

interface LabStaffRoomsProps {
  rooms: LabRoomStatus[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffRoomsView: React.FC<LabStaffRoomsProps> = ({ rooms, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<'IN USE' | 'ALL'>('IN USE');

  const inUseRooms = rooms.filter((r) => r.status === 'IN USE');
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE');

  const visibleRooms = statusFilter === 'IN USE' ? inUseRooms : rooms;

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-rooms-module" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        {/* Top 3 KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => setStatusFilter('IN USE')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {inUseRooms.length} Labs
              </div>
              <div className="text-xs text-slate-500">Currently In Use</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-blue-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {availableRooms.length} Labs
              </div>
              <div className="text-xs text-slate-500">Available Now</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-amber-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {maintenanceRooms.length} Lab
              </div>
              <div className="text-xs text-slate-500">Under Maintenance</div>
            </div>
          </button>
        </div>

        {/* 3-Column Active Lab Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleRooms.map((room) => {
            const isInUse = room.status === 'IN USE';
            const isAvailable = room.status === 'AVAILABLE';

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{room.name}</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">{room.location}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${isInUse
                        ? 'bg-emerald-50 text-emerald-700'
                        : isAvailable
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Session Details */}
                  {isInUse ? (
                    <div className="py-4 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{room.subject}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {room.instructor} ·{' '}
                          <strong className="text-slate-800">{room.section}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{room.timeslot}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-xs text-slate-400">
                      {isAvailable
                        ? 'No active class scheduled right now. Ready for open lab or reservation.'
                        : 'Scheduled hardware diagnostics and network switch inspection in progress.'}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono tabular-nums">
                    {room.totalPcs} Available PCs
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 font-mono tabular-nums">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {room.occupiedPcs}/{room.totalPcs} Pupils
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
