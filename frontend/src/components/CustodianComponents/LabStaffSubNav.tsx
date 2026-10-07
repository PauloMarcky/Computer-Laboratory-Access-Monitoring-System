import React from 'react';
import { ClipboardList, Download, FileWarning, Monitor, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { WireframeScreenId } from '../../types';

interface LabStaffSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffSubNav: React.FC<LabStaffSubNavProps> = ({ activeScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = React.useState(() => (
    window.sessionStorage.getItem('clams-custodian-nav') !== 'closed'
  ));
  const isReports = activeScreen === 'lab-staff-report-detail';
  const isLabRoomUsage = activeScreen === 'lab-staff-rooms-module';
  const isUsageHistory = activeScreen === 'lab-staff-usage-history';
  const isExport = activeScreen === 'lab-staff-report-export';

  const itemClass = (isActive: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${isActive
      ? 'bg-[#e8eef8] text-[#1b325f]'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;
  const closeNavigation = () => {
    setIsOpen(false);
    window.sessionStorage.setItem('clams-custodian-nav', 'closed');
  };
  const openNavigation = () => {
    setIsOpen(true);
    window.sessionStorage.removeItem('clams-custodian-nav');
  };
  const navigateAndClose = (screen: WireframeScreenId) => {
    closeNavigation();
    onNavigate(screen);
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
        <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <aside className="clams-sidebar z-20 flex flex-col border border-slate-200 bg-white px-3 pb-4 pt-5 no-print">
      <div className="mb-3 flex items-center justify-between gap-2 px-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Laboratory Operations
        </div>
        <button
          type="button"
          onClick={closeNavigation}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Hide laboratory operations navigation"
          title="Hide navigation"
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <button
          type="button"
          onClick={() => navigateAndClose('lab-staff-report-detail')}
          className={itemClass(isReports)}
        >
          <FileWarning className="h-4 w-4 shrink-0" aria-hidden="true" />
          Reports
        </button>

        <button
          type="button"
          onClick={() => navigateAndClose('lab-staff-rooms-module')}
          className={itemClass(isLabRoomUsage)}
        >
          <Monitor className="h-4 w-4 shrink-0" aria-hidden="true" />
          Lab Room Usage
        </button>

        <button
          type="button"
          onClick={() => navigateAndClose('lab-staff-usage-history')}
          className={itemClass(isUsageHistory)}
        >
          <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
          Laboratory Usages
        </button>

        <button
          type="button"
          onClick={() => navigateAndClose('lab-staff-report-export')}
          className={itemClass(isExport)}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          Export
        </button>
      </nav>
    </aside>
  );
};