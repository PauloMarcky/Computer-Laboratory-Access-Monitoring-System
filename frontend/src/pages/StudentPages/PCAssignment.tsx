import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import type { PCStation, WireframeScreenId } from '../../types';

interface StudentClaimPCProps {
  stations: PCStation[];
  activeSessionLabel: string;
  isTimedIn: boolean;
  selectedPc: string;
  isClaimedConfirmed: boolean;
  onSelectPc: (pcNum: string) => void;
  onTimeIn: () => Promise<void>;
  onConfirmClaim: () => Promise<void>;
  onNavigate: (screen: WireframeScreenId) => void;
  onLogout?: () => void | Promise<void>;
}

export const StudentClaimPCView: React.FC<StudentClaimPCProps> = ({
  stations,
  activeSessionLabel,
  isTimedIn,
  selectedPc,
  isClaimedConfirmed,
  onSelectPc,
  onTimeIn,
  onConfirmClaim,
  onNavigate,
  onLogout,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update your lab session.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" onLogout={onLogout} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {selectedPc ? `You're on PC-${selectedPc}` : 'No PC selected'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{activeSessionLabel || 'No active class session.'}</p>

        {!isTimedIn && (
          <button
            type="button"
            disabled={!activeSessionLabel || busy}
            onClick={() => void runAction(onTimeIn)}
            className="mt-4 w-full rounded-lg bg-[#1b325f] px-5 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!activeSessionLabel ? 'No active class to join' : busy ? 'Recording time-in...' : 'Time in to this class'}
          </button>
        )}

        {error && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}

        <div className="mt-5 rounded-lg bg-[#fef9c3] border border-[#fde047] px-4 py-3 flex items-center gap-2.5 text-xs text-amber-950">
          <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {!activeSessionLabel
              ? 'There is no active class session for your enrolled schedules.'
              : !isTimedIn
                ? 'Time in to the active class before claiming a PC.'
                : !selectedPc
                  ? 'Select a free PC station.'
                  : isClaimedConfirmed
                    ? `PC-${selectedPc} is marked as occupied by you.`
                    : 'Confirm your selected PC station to claim it.'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void runAction(onConfirmClaim)}
          disabled={!selectedPc || !isTimedIn || busy}
          className={`mt-4 w-full py-3.5 px-6 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-xs ${isClaimedConfirmed
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
            : 'bg-[#1b325f] hover:bg-[#142547] text-white'
            }`}
        >
          {!selectedPc
            ? 'Select a PC station'
            : isClaimedConfirmed
              ? busy ? 'Releasing PC...' : `Release PC-${selectedPc}`
              : busy ? 'Claiming PC...' : `Claim PC-${selectedPc}`}
        </button>

        {selectedPc && isClaimedConfirmed && (
          <p className="text-center text-[11px] text-slate-400 mt-2.5">
            PC-{selectedPc} is marked as occupied by you.
          </p>
        )}

        <section className="mt-6 bg-white rounded-xl border border-slate-200/90 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-bold text-slate-800">Lab Overview</h2>
            <span className="text-[11px] text-slate-400">Tap an open PC station to switch seat</span>
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
                  disabled={isOccupied || !isTimedIn || busy}
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

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => onNavigate('student-report-history')}
            className="flex-1 py-3 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            View my reports
          </button>
          <button
            type="button"
            onClick={() => onNavigate('student-report-issue')}
            disabled={!selectedPc || !isClaimedConfirmed}
            className="flex-1 py-3 px-4 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            Report a problem with this PC
          </button>
        </div>
      </main>
    </div>
  );
};
