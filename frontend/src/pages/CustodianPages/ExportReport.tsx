import React, { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ClamsHeader } from '../../components/ClamsHeader';
import { LabStaffSubNav } from '../../components/CustodianComponents/LabStaffSubNav';
import type { PCIssueReport, WireframeScreenId } from '../../types';

interface LabStaffExportProps {
  reports: PCIssueReport[];
  onSaveCustodianReport: (reportId: string, custodianReport: string) => Promise<void>;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffReportExportView: React.FC<LabStaffExportProps> = ({
  reports,
  onSaveCustodianReport,
  onNavigate,
}) => {
  const [reportDrafts, setReportDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const resolvedReports = reports.filter((report) => report.status === 'RESOLVED');

  const getDraft = (report: PCIssueReport) =>
    reportDrafts[report.id] ?? report.custodianReport ?? '';

  const saveReport = async (reportId: string, draft: string) => {
    setSavingId(reportId);
    setError('');
    try {
      await onSaveCustodianReport(reportId, draft.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save repair notes.');
    } finally {
      setSavingId(null);
    }
  };

  const savePdf = (report: PCIssueReport) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 46;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CLAMS - LABORATORY OPERATIONS', margin, currentY);
    currentY += 28;
    doc.setFontSize(18);
    doc.text('Resolved PC Issue Report', margin, currentY);
    currentY += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Report ID: ${report.id}`, margin, currentY);
    currentY += 12;
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 16;
    doc.setDrawColor(190, 198, 208);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 22;

    const addField = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(label, margin, currentY);
      currentY += 13;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(value || 'Not provided', contentWidth);
      const blockHeight = lines.length * 12 + 10;
      if (currentY + blockHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(lines, margin, currentY);
      currentY += blockHeight;
    };

    addField('Status', 'Resolved');
    addField('Computer', report.pcNumber);
    addField('Laboratory Room', report.labRoom);
    addField('Issue Category', report.category);
    addField('Reported By (Student ID)', report.studentId);
    addField('Subject', report.subjectCode || 'Not provided');
    addField('Class Schedule', [report.classDay, report.classTimeRange].filter(Boolean).join(' - ') || 'Not provided');
    addField('Issue Description', report.description);
    addField('Submitted', report.submittedAt);
    addField('Resolved', report.resolvedAt || 'Not provided');
    addField('Custodian Repair Report', getDraft(report).trim());

    const safePart = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';
    doc.save(`clams-pc-repair-${safePart(report.pcNumber)}-${safePart(report.id)}.pdf`);
  };

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
                <article
                  key={report.id}
                  className="rounded-lg border border-slate-300 bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Repair Report: {report.pcNumber}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.category} · Student {report.studentId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Resolved{report.resolvedAt ? ` · ${report.resolvedAt}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => savePdf(report)}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 no-print"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Save PDF
                      </button>
                    </div>
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
                        onClick={() => void saveReport(report.id, draft)}
                        disabled={!draft.trim() || !hasChanges || savingId === report.id}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 no-print"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingId === report.id ? 'Saving...' : 'Save Report'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
      </main>
    </div>
  );
};
