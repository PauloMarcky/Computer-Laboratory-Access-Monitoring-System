import React from 'react';
import type { WireframeScreenId } from '../../types';

interface LabStaffSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffSubNav: React.FC<LabStaffSubNavProps> = ({ activeScreen, onNavigate }) => {
  const isReports = activeScreen === 'lab-staff-report-detail';
  const isActivity =
    activeScreen === 'lab-staff-records-module' || activeScreen === 'lab-staff-rooms-module';
  const isExport = activeScreen === 'lab-staff-report-export';

  return (
    <div className="bg-white border-b border-slate-200 px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onNavigate('lab-staff-report-detail')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isReports
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Reports
          </button>

          <button
            type="button"
            onClick={() => onNavigate('lab-staff-records-module')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isActivity
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Laboratory Record
          </button>

          <button
            type="button"
            onClick={() => onNavigate('lab-staff-report-export')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isExport
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Export
          </button>
        </nav>

        {isActivity && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg my-1.5">
            <button
              type="button"
              onClick={() => onNavigate('lab-staff-records-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'lab-staff-records-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Usage Records
            </button>
            <button
              type="button"
              onClick={() => onNavigate('lab-staff-rooms-module')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'lab-staff-rooms-module'
                ? 'bg-white text-[#1b325f] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Lab Rooms Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
