import React, { useState } from 'react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { LabStaffSubNav } from '../../components/CustodianComponents/LabStaffSubNav';
import { PCIssueRepairQueue } from '../../components/CustodianComponents/PCIssueRepairQueue';
import type { ClassReportSubmission, PCIssueReport, WireframeScreenId } from '../../types';

interface LabStaffReportDetailProps {
  selectedReport?: ClassReportSubmission;
  onUpdateReportStatus: (
    reportId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    remarks: string
  ) => void;
  pcIssueReports: PCIssueReport[];
  onMarkPcIssueFixed: (reportId: string) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffReportDetailView: React.FC<LabStaffReportDetailProps> = ({
  selectedReport,
  onUpdateReportStatus,
  pcIssueReports,
  onMarkPcIssueFixed,
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
          <PCIssueRepairQueue reports={pcIssueReports} onMarkFixed={onMarkPcIssueFixed} />
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
            View Fixed PC Issues
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
        <PCIssueRepairQueue reports={pcIssueReports} onMarkFixed={onMarkPcIssueFixed} />
      </main>
    </div>
  );
};
