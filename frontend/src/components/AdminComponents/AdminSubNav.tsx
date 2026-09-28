import React from 'react';
import type { WireframeScreenId } from '../../types';

interface AdminSubNavProps {
  activeScreen: WireframeScreenId;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeScreen, onNavigate }) => {
  const isSchedules =
    activeScreen === 'admin-schedule-module' ||
    activeScreen === 'admin-schedule-add-module';
  const isReports = activeScreen === 'admin-reports-dashboard';
  const isAnalytics = activeScreen === 'admin-students-analytics';

  return (
    <div className="bg-white border-b border-slate-200 px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onNavigate('admin-schedule-module')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isSchedules
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Schedules
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-reports-dashboard')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isReports
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Class Reports
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-teacher-workload')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeScreen === 'admin-teacher-workload'
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Instructors Workload
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-students-analytics')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${isAnalytics
              ? 'border-[#1b325f] text-[#1b325f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Analytics Report
          </button>
        </nav>


      </div>
    </div>
  );
};
