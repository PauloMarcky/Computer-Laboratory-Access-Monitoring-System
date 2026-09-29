import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import type { PCIssueReport, WireframeScreenId } from '../../types';

interface StudentReportIssueProps {
  selectedPc: string;
  reports: PCIssueReport[];
  onSubmitIssue: (category: PCIssueReport['category'], description: string) => void;
  onNavigate: (screen: WireframeScreenId) => void;
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
  onSubmitIssue,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<PCIssueReport['category']>('Mouse / Keyboard');
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!selectedPc || !trimmedDescription) return;

    onSubmitIssue(selectedCategory, trimmedDescription);
    setSubmittedSuccess(true);
    setDescription('');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a PC Issue</h1>
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

        <form
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
            disabled={!selectedPc || !description.trim()}
            className="w-full py-3.5 px-6 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Report
          </button>

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
        </form>

        {reports.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Recent Reports Logged in Session ({reports.length})
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {reports.map((report) => (
                <div key={report.id} className="py-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-semibold text-slate-800">{report.pcNumber}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">{report.category}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-slate-500">{report.description}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {report.submittedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
