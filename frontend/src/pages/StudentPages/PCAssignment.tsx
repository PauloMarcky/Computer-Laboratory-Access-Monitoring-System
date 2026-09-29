import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import type { PCStation, WireframeScreenId } from '../../types';

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
}) => (
  <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
    <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />

    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {selectedPc ? `You're on PC-${selectedPc}` : 'No PC selected'}
      </h1>
      <p className="text-xs text-slate-500 mt-1">No active session data.</p>

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
