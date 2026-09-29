import React from 'react';
import { Wrench } from 'lucide-react';
import type { PCIssueReport } from '../../types';

interface PCIssueRepairQueueProps {
  reports: PCIssueReport[];
  onMarkFixed: (reportId: string) => void;
}

export const PCIssueRepairQueue: React.FC<PCIssueRepairQueueProps> = ({
  reports,
  onMarkFixed,
}) => {
  const openReports = reports.filter((report) => report.status === 'Open');

  return (
    <section className="mt-8 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Open PC Issues</h2>
        <p className="mt-1 text-xs text-slate-500">
          Mark an issue fixed when the repair is complete. Fixed issues become available in Export.
        </p>
      </div>

      {openReports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          No open PC issues.
        </div>
      ) : (
        <div className="space-y-3">
          {openReports.map((report) => (
            <article
              key={report.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-sm font-bold text-slate-900">{report.pcNumber}</h3>
                  <span className="text-xs font-semibold text-slate-600">{report.category}</span>
                  <span className="text-xs text-slate-400">Student {report.studentId}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{report.description}</p>
                <p className="mt-2 text-[11px] text-slate-400">Reported {report.submittedAt}</p>
              </div>
              <button
                type="button"
                onClick={() => onMarkFixed(report.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                <Wrench className="h-3.5 w-3.5" />
                Mark Fixed
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};