import React from 'react';
import { LogOut } from 'lucide-react';
import universityLogo from '../assets/images/uls-cit-logo.png';
import { WireframeScreenId } from '../types';

interface ClamsHeaderProps {
  onNavigate: (screen: WireframeScreenId) => void;
  statusLabel?: string;
}

export const ClamsHeader: React.FC<ClamsHeaderProps> = ({
  onNavigate,
  statusLabel = 'Computer Laboratory System',
}) => {
  const logoutDialogRef = React.useRef<HTMLDialogElement>(null);

  const handleLogout = () => {
    logoutDialogRef.current?.showModal();
  };

  const confirmLogout = () => {
    logoutDialogRef.current?.close();
    onNavigate('login-portal');
  };

  return (
    <header className="bg-[#1b325f] text-white px-6 py-3.5 border-b border-[#142547] no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand mark */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-lg"
          title="Log out and return to Access Level Portal"
        >
          <img
            src={universityLogo}
            alt="University of La Salette logo"
            className="h-10 w-auto max-w-40 object-contain shrink-0"
          />
          <div>
            <div className="text-base font-bold tracking-tight text-white leading-tight group-hover:text-amber-200 transition-colors">
              CLAMS
            </div>
            <div className="text-[11px] text-slate-300 leading-tight">
              University of La Salette, Inc.
            </div>
          </div>
        </button>

        {/* Zone 3: Active Lab Status & Portal Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#243f75] border border-white/10 text-xs text-slate-100 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{statusLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            title="Switch Access Level"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      <dialog
        ref={logoutDialogRef}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            logoutDialogRef.current?.close();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
      >
        <div className="p-6">
          <h2 id="logout-dialog-title" className="text-lg font-semibold text-slate-900">
            Log out?
          </h2>
          <p id="logout-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">
            You will return to role selection.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => logoutDialogRef.current?.close()}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b325f]"
            >
              <LogOut size={15} aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      </dialog>
    </header>
  );
};
