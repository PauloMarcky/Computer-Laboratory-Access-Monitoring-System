import React from 'react';
import { ClipboardList, Download, FileWarning, Menu, Monitor, X } from 'lucide-react';
import type { WireframeScreenId } from '../../types';

interface LabStaffSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffSubNav: React.FC<LabStaffSubNavProps> = ({ activeScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = React.useState(() => (
    window.sessionStorage.getItem('clams-custodian-nav') === 'open'
  ));
  const [justOpened, setJustOpened] = React.useState(false);

  React.useEffect(() => {
    if (!justOpened) return;
    const timer = window.setTimeout(() => setJustOpened(false), 320);
    return () => window.clearTimeout(timer);
  }, [justOpened]);

  const isReports = activeScreen === 'lab-staff-report-detail';
  const isExport = activeScreen === 'lab-staff-report-export';
  const isLabUsage =
    activeScreen === 'lab-staff-rooms-module' || activeScreen === 'lab-staff-usage-history';

  const itemClass = (isActive: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${isActive
      ? 'bg-[#e8eef8] text-[#1b325f]'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const openNavigation = () => {
    setJustOpened(true);
    setIsOpen(true);
    window.sessionStorage.setItem('clams-custodian-nav', 'open');
  };

  const closeNavigation = () => {
    setIsOpen(false);
    window.sessionStorage.setItem('clams-custodian-nav', 'closed');
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openNavigation}
        className="clams-sidebar-toggle no-print"
        aria-label="Show laboratory operations navigation"
        title="Show navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <aside
      className={`clams-sidebar z-20 flex flex-col border border-slate-200 bg-white px-4 pb-5 pt-6 no-print ${justOpened ? 'admin-sidebar-slide-in' : ''
        }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 px-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Laboratory Ops
        </div>
        <button
          type="button"
          onClick={closeNavigation}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Hide laboratory operations navigation"
          title="Hide navigation"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        <button
          type="button"
          onClick={() => onNavigate('lab-staff-report-detail')}
          className={itemClass(isReports)}
        >
          <FileWarning className="h-4 w-4 shrink-0" aria-hidden="true" />
          Reports
        </button>

        <button
          type="button"
          onClick={() => onNavigate('lab-staff-rooms-module')}
          className={itemClass(isLabUsage)}
        >
          <Monitor className="h-4 w-4 shrink-0" aria-hidden="true" />
          Laboratory Usage
        </button>

        <button
          type="button"
          onClick={() => onNavigate('lab-staff-report-export')}
          className={itemClass(isExport)}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          Export
        </button>
      </nav>
    </aside>
  );
};