import React, { useState } from 'react';
import { Printer, Save } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { LabStaffSubNav } from '../../components/CustodianComponents/LabStaffSubNav';
import type { PCIssueReport, WireframeScreenId } from '../../types';

interface LabStaffExportProps {
  reports: PCIssueReport[];
  onSaveCustodianReport: (reportId: string, custodianReport: string) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffReportExportView: React.FC<LabStaffExportProps> = ({
  reports,
  onSaveCustodianReport,
  onNavigate,
}) => {
  const [reportDrafts, setReportDrafts] = useState<Record<string, string>>({});
  const resolvedReports = reports.filter((report) => report.status === 'Resolved');

  const getDraft = (report: PCIssueReport) =>
    reportDrafts[report.id] ?? report.custodianReport ?? '';

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-report-export" onNavigate={onNavigate} />

      <main className="max-w-5xl mx-auto px-6 py-7 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 no-print">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Fixed PC Issue Reports</h1>
            <p className="mt-1 text-xs text-slate-500">
              Only issues marked fixed appear here. Add the repair details before exporting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={resolvedReports.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-[#1b325f] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#142547] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>

        {resolvedReports.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
            <h2 className="text-sm font-semibold text-slate-700">No fixed PC issues to export</h2>
            <p className="mt-1 text-xs text-slate-500">
              Issues will appear here after a custodian marks them fixed.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {resolvedReports.map((report) => {
              const draft = getDraft(report);
              const hasChanges = draft !== (report.custodianReport ?? '');

              return (
                <article key={report.id} className="rounded-lg border border-slate-300 bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Repair Report: {report.pcNumber}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.category} · Student {report.studentId}
                      </p>
                    </div>
                    <span className="rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Fixed{report.resolvedAt ? ` · ${report.resolvedAt}` : ''}
                    </span>
                  </div>

                  <dl className="grid gap-3 py-4 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500">Issue reported</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-slate-800">{report.description}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Submitted</dt>
                      <dd className="mt-1 text-slate-800">{report.submittedAt}</dd>
                    </div>
                  </dl>

                  <div className="border-t border-slate-200 pt-4">
                    <label
                      htmlFor={`custodian-report-${report.id}`}
                      className="mb-2 block text-xs font-semibold text-slate-700"
                    >
                      Custodian repair report
                    </label>
                    <textarea
                      id={`custodian-report-${report.id}`}
                      rows={4}
                      value={draft}
                      onChange={(event) =>
                        setReportDrafts((current) => ({ ...current, [report.id]: event.target.value }))
                      }
                      placeholder="Describe the repair performed and the result."
                      className="w-full resize-y rounded-md border border-slate-300 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1b325f] focus:outline-none"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onSaveCustodianReport(report.id, draft.trim())}
                        disabled={!draft.trim() || !hasChanges}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 no-print"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Report
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
