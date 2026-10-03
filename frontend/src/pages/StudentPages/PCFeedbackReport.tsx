import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import type { PCIssueReport, WireframeScreenId } from '../../types';

interface StudentReportIssueProps {
  selectedPc: string;
  reports: PCIssueReport[];
  canSubmitIssue: boolean;
  onSubmitIssue: (category: PCIssueReport['category'], description: string) => Promise<void>;
  onNavigate: (screen: WireframeScreenId) => void;
  onLogout?: () => void | Promise<void>;
}

const ISSUE_CATEGORIES: PCIssueReport['category'][] = [
  'Mouse / Keyboard',
  'Monitor',
  'No Power',
  'No Network',
  'Software',
  'Other',
];

export const StudentReportIssueView: React.FC<StudentReportIssueProps> = ({
  selectedPc,
  reports,
  canSubmitIssue,
  onSubmitIssue,
  onNavigate,
  onLogout,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<PCIssueReport['category']>('Mouse / Keyboard');
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!selectedPc || !trimmedDescription) return;

    setSubmitting(true);
    setError('');
    try {
      await onSubmitIssue(selectedCategory, trimmedDescription);
      setSubmittedSuccess(true);
      setDescription('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit the issue report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" onLogout={onLogout} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {canSubmitIssue ? 'Report a PC Issue' : 'My PC Reports'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
              {selectedPc ? `PC-${selectedPc}` : 'No PC selected'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('student-claim-pc')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1b325f] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Seat Claim</span>
          </button>
        </div>

        {canSubmitIssue && <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white rounded-xl border border-slate-200/90 p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2.5">
              Issue Category
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ISSUE_CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSubmittedSuccess(false);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${active
                      ? 'bg-[#1b325f] border-[#1b325f] text-white shadow-2xs'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="issue-description"
              className="block text-xs font-bold text-slate-700 mb-2"
            >
              Describe the issue
            </label>
            <textarea
              id="issue-description"
              rows={4}
              required
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmittedSuccess(false);
              }}
              placeholder="e.g. Left click doesn't register"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/40 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1b325f] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedPc || !description.trim() || submitting}
            className="w-full py-3.5 px-6 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>

          {error && <p className="text-xs text-rose-700">{error}</p>}

          {submittedSuccess && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Issue report recorded for this session against PC-{selectedPc}.</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('student-claim-pc')}
                className="font-semibold underline whitespace-nowrap cursor-pointer"
              >
                Return to PC-{selectedPc}
              </button>
            </div>
          )}
        </form>}

        {reports.length > 0 ? (
          <div className="mt-6 bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-xs font-bold text-slate-700">
                My Reports ({reports.length})
              </div>
              <span className="text-[11px] text-slate-500">Updated by lab staff</span>
            </div>
            <div className="space-y-3 text-xs">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800">{report.pcNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-700">{report.category}</span>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${report.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : report.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-700'
                        : report.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 font-medium">
                    {report.subjectCode || 'Subject'} • {report.classDay || 'Day'} • {report.classTimeRange || 'Time'}
                  </div>

                  <p className="mt-2 text-slate-600">{report.description}</p>
                  <p className="mt-2 text-[11px] text-slate-500">Submitted {report.submittedAt}</p>

                  <div className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                      Custodian update
                    </div>
                    {report.custodianReport ? (
                      <p className="text-slate-700 leading-5">{report.custodianReport}</p>
                    ) : (
                      <p className="text-slate-400">Waiting for a custodian update on this report.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
            No reports submitted yet. Once you submit a lab issue, it will appear here with the latest custodian update.
          </div>
        )}
      </main>
    </div>
  );
};
