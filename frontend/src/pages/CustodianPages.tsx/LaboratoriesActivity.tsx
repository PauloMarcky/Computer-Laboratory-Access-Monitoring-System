import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Clock, Download, Monitor, Search, User, Users, Wrench } from 'lucide-react';
import { ClamsHeader } from '../../components/ClamsHeader';
import { LabStaffSubNav } from '../../components/CustodianComponents/LabStaffSubNav';
import type { LabRoomStatus, LabUsageRecord, WireframeScreenId } from '../../types';

interface LabStaffRecordsProps {
  records: LabUsageRecord[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffRecordsView: React.FC<LabStaffRecordsProps> = ({
  records,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [labFilter, setLabFilter] = useState('All Laboratories');
  const [ayFilter, setAyFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      !searchQuery.trim() ||
      rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLab = labFilter === 'All Laboratories' || rec.laboratory === labFilter;
    const matchesAy = !ayFilter || rec.academicYear === ayFilter;
    const matchesSem = !semFilter || rec.semester === semFilter;
    return matchesSearch && matchesLab && matchesAy && matchesSem;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const displayedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Timeslot',
      'Laboratory',
      'Subject',
      'Instructor',
      'Section',
      'Year Level',
      'Status',
    ];
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((r) =>
        [
          `"${r.date}"`,
          `"${r.timeslot}"`,
          `"${r.laboratory}"`,
          `"${r.subject}"`,
          `"${r.instructor}"`,
          `"${r.section}"`,
          `"${r.yearLevel}"`,
          `"${r.status}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clams-lab-usage-records.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader
        onNavigate={onNavigate}
        statusLabel="Computer Laboratory System"
      />
      <LabStaffSubNav activeScreen="lab-staff-records-module" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-5">

        {/* Filters & Export Bar */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by subject or instructor..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b325f]"
              />
            </div>

            <select
              value={labFilter}
              onChange={(e) => {
                setLabFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="All Laboratories">All Laboratories</option>
              {[...new Set(records.map((record) => record.laboratory))].map((laboratory) => (
                <option key={laboratory} value={laboratory}>{laboratory}</option>
              ))}
            </select>

            <select
              value={ayFilter}
              onChange={(e) => setAyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="">All Academic Years</option>
              {[...new Set(records.map((record) => record.academicYear))].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b325f] cursor-pointer"
            >
              <option value="">All Semesters</option>
              {[...new Set(records.map((record) => record.semester))].map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Records</span>
          </button>
        </section>

        {/* Data Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Timeslot</th>
                  <th className="py-3.5 px-4">Laboratory</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Year Level</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No usage records.
                    </td>
                  </tr>
                )}
                {displayedRecords.map((rec) => {
                  const statusStyle =
                    rec.status === 'ONGOING'
                      ? 'bg-blue-50 text-blue-700'
                      : rec.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {rec.timeslot}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rec.laboratory}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1b325f] whitespace-nowrap">
                        {rec.subject}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {rec.instructor}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {rec.section}
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {rec.yearLevel}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${statusStyle}`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>

            </div>

            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                &larr; Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${currentPage === page
                    ? 'bg-[#1b325f] text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

interface LabStaffRoomsProps {
  rooms: LabRoomStatus[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LabStaffRoomsView: React.FC<LabStaffRoomsProps> = ({ rooms, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<'IN USE' | 'ALL'>('IN USE');

  const inUseRooms = rooms.filter((r) => r.status === 'IN USE');
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE');

  const visibleRooms = statusFilter === 'IN USE' ? inUseRooms : rooms;

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <ClamsHeader onNavigate={onNavigate} statusLabel="Computer Laboratory System" />
      <LabStaffSubNav activeScreen="lab-staff-rooms-module" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        {/* Top 3 KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => setStatusFilter('IN USE')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {inUseRooms.length} Labs
              </div>
              <div className="text-xs text-slate-500">Currently In Use</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-blue-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {availableRooms.length} Labs
              </div>
              <div className="text-xs text-slate-500">Available Now</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 text-left hover:border-amber-300 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {maintenanceRooms.length} Lab
              </div>
              <div className="text-xs text-slate-500">Under Maintenance</div>
            </div>
          </button>
        </div>

        {/* 3-Column Active Lab Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleRooms.map((room) => {
            const isInUse = room.status === 'IN USE';
            const isAvailable = room.status === 'AVAILABLE';

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{room.name}</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">{room.location}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${isInUse
                        ? 'bg-emerald-50 text-emerald-700'
                        : isAvailable
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Session Details */}
                  {isInUse ? (
                    <div className="py-4 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{room.subject}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {room.instructor} ·{' '}
                          <strong className="text-slate-800">{room.section}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{room.timeslot}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-xs text-slate-400">
                      {isAvailable
                        ? 'No active class scheduled right now. Ready for open lab or reservation.'
                        : 'Scheduled hardware diagnostics and network switch inspection in progress.'}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono tabular-nums">
                    {room.totalPcs} Available PCs
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 font-mono tabular-nums">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {room.occupiedPcs}/{room.totalPcs} Pupils
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
