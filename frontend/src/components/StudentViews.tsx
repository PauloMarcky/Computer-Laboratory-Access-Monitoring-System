import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { ClamsHeader } from './ClamsHeader';
import { PCIssueReport, PCStation, WireframeScreenId } from '../types';

interface StudentClaimPCProps {
  stations: PCStation[];
  selectedPc: string;
  isClaimedConfirmed: boolean;
  onSelectPc: (pcNum: string) => void;
  onConfirmClaim: () => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const StudentClaimPCView: React.FC<StudentClaimPCProps> = ({
  stations,
  selectedPc,
  isClaimedConfirmed,
  onSelectPc,
  onConfirmClaim,
  onNavigate,
}) => {
  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {selectedPc ? `You're on PC-${selectedPc}` : 'No PC selected'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">No active session data.</p>

        {/* Attendance Verification Banner */}
        <div className="mt-5 rounded-lg bg-[#fef9c3] border border-[#fde047] px-4 py-3 flex items-center gap-2.5 text-xs text-amber-950">
          <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {!selectedPc
              ? 'No PC station is assigned.'
              : isClaimedConfirmed
                ? `PC-${selectedPc} is marked as occupied by you.`
                : 'Scan an ID before claiming a PC station.'}
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onConfirmClaim}
          disabled={!selectedPc}
          className={`mt-4 w-full py-3.5 px-6 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-xs ${isClaimedConfirmed
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
            : 'bg-[#1b325f] hover:bg-[#142547] text-white'
            }`}
        >
          {!selectedPc
            ? 'No PC selected'
            : isClaimedConfirmed
              ? `PC-${selectedPc} Marked as Occupied by You (Tap to Toggle)`
              : `Mark PC-${selectedPc} as occupied by me`}
        </button>

        {selectedPc && isClaimedConfirmed && (
          <p className="text-center text-[11px] text-slate-400 mt-2.5">
            PC-{selectedPc} is marked as occupied by you.
          </p>
        )}

        {/* Lab Overview Card */}
        <section className="mt-6 bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-bold text-slate-800">Lab Overview</h2>
            <span className="text-[11px] text-slate-400">
              Tap an open PC station to switch seat
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stations.length === 0 && (
              <p className="text-xs text-slate-400">No PC stations available.</p>
            )}
            {stations.map((pc) => {
              const isYou = pc.number === selectedPc || pc.status === 'you';
              const isOccupied = !isYou && pc.status === 'occupied';

              return (
                <button
                  key={pc.number}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => onSelectPc(pc.number)}
                  title={
                    isYou
                      ? `PC-${pc.number} (Your current station)`
                      : isOccupied
                        ? `PC-${pc.number} occupied by ${pc.occupantName}`
                        : `Switch to PC-${pc.number}`
                  }
                  className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono tabular-nums transition-all ${isYou
                    ? 'bg-blue-50/90 border-2 border-[#1b325f] text-[#1b325f] font-bold cursor-pointer shadow-2xs'
                    : isOccupied
                      ? 'bg-rose-100/90 border border-rose-200 text-rose-800 font-semibold cursor-not-allowed'
                      : 'bg-slate-100/90 border border-slate-200/90 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-200/60 cursor-pointer'
                    }`}
                >
                  <span className="text-xs leading-none">{pc.number}</span>
                  {isYou && (
                    <span className="text-[9px] font-sans font-bold tracking-wider uppercase mt-1 leading-none text-[#1b325f]">
                      YOU
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Red = occupied · Outline = free · Blue = you
          </div>
        </section>

        {/* Bottom Report Problem Button */}
        <button
          type="button"
          onClick={() => onNavigate('student-report-issue')}
          disabled={!selectedPc}
          className="mt-5 w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          Report a problem with this PC
        </button>
      </main>
    </div>
  );
};

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPc) return;
    onSubmitIssue(
      selectedCategory,
      description.trim()
    );
    setSubmittedSuccess(true);
    setDescription('');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Report a PC Issue
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

        {/* Form Card */}
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
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSubmittedSuccess(false);
              }}
              placeholder="e.g. Left click doesn't register"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/40 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1b325f] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedPc}
            className="w-full py-3.5 px-6 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Submit Report
          </button>

          {submittedSuccess && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Issue report ({selectedCategory}) logged against PC-{selectedPc} and forwarded to the Dean&apos;s dashboard.
                </span>
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

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Sent directly to the Dean&apos;s dashboard and logged against PC-{selectedPc} · No instructor action is needed
        </p>

        {reports.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Recent Reports Logged in Session ({reports.length})
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {reports.map((rep) => (
                <div key={rep.id} className="py-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-semibold text-slate-800">{rep.pcNumber}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">{rep.category}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-slate-500">{rep.description}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {rep.submittedAt}
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
