import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ClipboardList, Clock, Download, Monitor, Search, User, Users, Wrench } from 'lucide-react';
import { jsPDF } from 'jspdf';
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
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      !searchQuery.trim() ||
      rec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.laboratory.toLowerCase().includes(searchQuery.toLowerCase());
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

  const savePdf = (record: LabUsageRecord, mode: 'room-usage' | 'attendance-sheet') => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    const title = mode === 'room-usage' ? 'Laboratory Room Usage' : 'Laboratory Attendance Sheet';

    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CLAMS - LABORATORY OPERATIONS', margin, 42);
    doc.setFontSize(18);
    doc.text(title, margin, 68);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 86);

    const details = [
      ['Date', record.date],
      ['Laboratory Room', record.laboratory],
      ['Subject', `${record.subject} - ${record.subjectName}`],
      ['Instructor', record.instructor],
      ['Section / Year Level', `${record.section} / ${record.yearLevel}`],
      ['Session Time', record.timeslot],
      ['Academic Year', record.academicYear || 'Not specified'],
      ['Semester', record.semester || 'Not specified'],
      ['Session Status', 'Completed'],
    ];
    const detailsTop = 112;
    const detailColumnWidth = (contentWidth - 20) / 2;
    details.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + column * (detailColumnWidth + 20);
      const y = detailsTop + row * 36;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(label, x, y);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(value, detailColumnWidth), x, y + 13);
    });

    if (mode === 'attendance-sheet') {
      const tableTop = detailsTop + Math.ceil(details.length / 2) * 36 + 18;
      const headers = ['No.', 'Student Name', 'School ID', 'Time In', 'Time Out', 'PC', 'Attendance'];
      const columnWidths = [28, 100, 78, 68, 68, 48, contentWidth - 390];
      let currentY = tableTop;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Student Attendance', margin, currentY);
      currentY += 14;

      const drawTableHeader = () => {
        doc.setFillColor(27, 50, 95);
        doc.setTextColor(255, 255, 255);
        doc.rect(margin, currentY, contentWidth, 24, 'F');
        let x = margin;
        headers.forEach((header, index) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(header, x + 4, currentY + 15);
          x += columnWidths[index];
        });
        currentY += 24;
        doc.setTextColor(20, 20, 20);
      };

      drawTableHeader();
      record.students.forEach((student, index) => {
        const values = [
          String(index + 1),
          student.formalName || student.name,
          student.studentId,
          student.timeIn,
          student.timeOut || 'Not recorded',
          student.pcNumber,
          `Present - ${student.status}`,
        ];
        const lines = values.map((value, valueIndex) =>
          doc.splitTextToSize(value, columnWidths[valueIndex] - 8)
        );
        const rowHeight = Math.max(22, ...lines.map((cellLines) => cellLines.length * 10 + 8));

        if (currentY + rowHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          drawTableHeader();
        }

        doc.setFillColor(index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 247 : 255, index % 2 === 0 ? 250 : 255);
        doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
        doc.setDrawColor(220, 224, 230);
        doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);
        let x = margin;
        lines.forEach((cellLines, cellIndex) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(cellLines, x + 4, currentY + 13);
          x += columnWidths[cellIndex];
        });
        currentY += rowHeight;
      });

      if (record.students.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('No student attendance recorded.', margin, currentY + 16);
      }
    }

    const filenamePart = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'class';
    doc.save(`clams-${mode}-${filenamePart(record.subject)}-${filenamePart(record.section)}-${filenamePart(record.date)}.pdf`);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#f4f6f9]">
      <div>
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
                  placeholder="Search by class, room, or instructor..."
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

          </section>

          {/* Data Table */}
          <section className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Laboratory</th>
                    <th className="py-3.5 px-4">Session Time</th>
                    <th className="py-3.5 px-4">Instructor</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No completed class usage records.
                      </td>
                    </tr>
                  )}
                  {displayedRecords.map((rec) => {
                    return (
                      <React.Fragment key={rec.id}>
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                            {rec.date}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              aria-expanded={expandedRecordId === rec.id}
                              onClick={() => setExpandedRecordId((current) => current === rec.id ? null : rec.id)}
                              className="flex items-center gap-2 text-left"
                            >
                              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandedRecordId === rec.id ? 'rotate-180' : ''}`} />
                              <span>
                                <span className="block font-bold text-[#1b325f]">{rec.subject}</span>
                                <span className="block text-[10px] font-medium text-slate-500">{rec.subjectName} · Section {rec.section} · Year {rec.yearLevel}</span>
                              </span>
                            </button>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {rec.laboratory}
                          </td>
                          <td className="py-4 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                            {rec.timeslot}
                          </td>
                          <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                            {rec.instructor}
                          </td>
                          <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                            {rec.studentsPresent} / {rec.studentsTotal} present
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Export room usage PDF without student attendance"
                                aria-label={`Export room usage PDF for ${rec.subject}`}
                                onClick={() => savePdf(rec, 'room-usage')}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Download className="h-3.5 w-3.5" /> Save Room PDF
                              </button>
                              <button
                                type="button"
                                title="Export attendance sheet PDF"
                                aria-label={`Export attendance sheet PDF for ${rec.subject}`}
                                onClick={() => savePdf(rec, 'attendance-sheet')}
                                className="inline-flex items-center gap-1.5 rounded-md bg-[#1b325f] px-2.5 py-2 text-[11px] font-semibold text-white hover:bg-[#142547]"
                              >
                                <Download className="h-3.5 w-3.5" /> Save Attendance PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRecordId === rec.id && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50 px-6 py-4">
                              {rec.students.length === 0 ? (
                                <p className="py-3 text-center text-xs text-slate-500">No student attendance recorded for this class.</p>
                              ) : (
                                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                                      <tr>
                                        <th className="px-3 py-2.5">Student</th>
                                        <th className="px-3 py-2.5">School ID</th>
                                        <th className="px-3 py-2.5">Time In</th>
                                        <th className="px-3 py-2.5">Time Out</th>
                                        <th className="px-3 py-2.5">PC</th>
                                        <th className="px-3 py-2.5">Attendance</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {rec.students.map((student) => (
                                        <tr key={student.id}>
                                          <td className="px-3 py-2.5 font-semibold text-slate-800">{student.name}</td>
                                          <td className="px-3 py-2.5 font-mono text-slate-600">{student.studentId}</td>
                                          <td className="px-3 py-2.5 font-mono text-slate-600">{student.timeIn}</td>
                                          <td className="px-3 py-2.5 font-mono text-slate-600">{student.timeOut || 'Not recorded'}</td>
                                          <td className="px-3 py-2.5 font-mono text-slate-600">{student.pcNumber}</td>
                                          <td className="px-3 py-2.5 text-slate-600">{student.status}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
