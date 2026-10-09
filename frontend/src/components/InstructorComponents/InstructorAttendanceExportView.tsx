import { ArrowLeft, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { AttendanceEntry, WireframeScreenId } from '../../types';

interface InstructorAttendanceExportViewProps {
  attendance: AttendanceEntry[];
  onNavigate: (screen: WireframeScreenId) => void;
  onBackToSchedule: () => void;
}

export const InstructorAttendanceExportView = ({
  attendance,
  onNavigate,
  onBackToSchedule,
}: InstructorAttendanceExportViewProps) => {
  const handlePrint = () => {
    document.title = 'Attendance Log - Print';
    window.print();
  };

  const handleSaveAsPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const title = 'CLAMS Attendance Log';
    const rows = attendance.length ? attendance : [{
      studentId: 'N/A',
      formalName: 'No attendance records',
      timeIn: '—',
      pcNumber: '—',
      status: '—',
    }];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, margin, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 72);
    doc.text(`Records: ${attendance.length}`, margin, 88);

    const tableX = margin;
    const tableY = 110;
    const colWidths = [70, 110, 170, 80, 60, 80];
    const headers = ['Student ID', 'Name', 'Time In', 'PC #', 'Status'];
    let currentY = tableY;

    doc.setFillColor(27, 50, 95);
    doc.setTextColor(255, 255, 255);
    doc.rect(tableX, currentY, pageWidth - margin * 2, 22, 'F');
    let x = tableX;
    headers.forEach((header, index) => {
      const headerX = x + 8;
      doc.text(header, headerX, currentY + 14);
      x += colWidths[index];
    });
    currentY += 22;

    doc.setTextColor(20, 20, 20);
    rows.forEach((row, index) => {
      const rowY = currentY + index * 18;
      const fill = index % 2 === 0 ? [245, 247, 250] : [255, 255, 255];
      doc.setFillColor(fill[0], fill[1], fill[2]);
      doc.rect(tableX, rowY, pageWidth - margin * 2, 18, 'F');

      let cellX = tableX;
      const values = [row.studentId, row.formalName, row.timeIn, row.pcNumber, row.status];
      values.forEach((value, valueIndex) => {
        doc.text(String(value), cellX + 8, rowY + 12);
        cellX += colWidths[valueIndex];
      });
    });

    doc.save('clams-attendance-log.pdf');
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-white py-8 px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 no-print">
        <button
          type="button"
          onClick={() => {
            onBackToSchedule();
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#1b325f] cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-sm md:text-base">Back to Schedule</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#1b325f] hover:bg-[#142547] text-white text-sm font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAsPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white px-4 sm:px-6 py-6">
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <h1 className="text-lg font-bold tracking-wide text-slate-900 uppercase">
            UNIVERSITY OF LA SALETTE, INC.
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Santiago City, Isabela</p>
          <p className="text-sm font-bold tracking-wider text-slate-800 uppercase mt-3">
            COLLEGE OF INFORMATION TECHNOLOGY — COMPUTER LAB ATTENDANCE LOG
          </p>
        </div>

        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 no-print">
          Choose <span className="font-semibold">Save as PDF</span> in the browser print dialog to save the attendance log as a PDF file.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-800 mb-5">
          <div className="space-y-1">
            <div><span className="font-bold">Subject Code:</span> —</div>
            <div><span className="font-bold">Laboratory Room:</span> —</div>
            <div><span className="font-bold">Instructor Name:</span> —</div>
          </div>
          <div className="space-y-1 sm:text-right">
            <div><span className="font-bold">Date:</span> —</div>
            <div><span className="font-bold">Scheduled Time:</span> —</div>
            <div><span className="font-bold">Session Start / End:</span> —</div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-300">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#1b325f] text-white font-semibold">
                <th className="py-2.5 px-3 border-r border-slate-600/40 w-10">#</th>
                <th className="py-2.5 px-3 border-r border-slate-600/40">Student ID</th>
                <th className="py-2.5 px-3 border-r border-slate-600/40">Full Name</th>
                <th className="py-2.5 px-3 border-r border-slate-600/40">Time In</th>
                <th className="py-2.5 px-3 border-r border-slate-600/40">PC #</th>
                <th className="py-2.5 px-3 border-r border-slate-600/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {attendance.map((row, index) => (
                <tr key={row.id} className="bg-white">
                  <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-600">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-600">
                    {row.studentId}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-900">
                    {row.formalName}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-700">
                    {row.timeIn}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-mono tabular-nums text-slate-700">
                    {row.pcNumber}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-semibold text-slate-800">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-16 pt-4 text-center text-sm">
          <div className="max-w-xs mx-auto w-full">
            <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">—</div>
            <div className="text-xs text-slate-500 mt-0.5">Class Instructor Signature &amp; Date</div>
          </div>
          <div className="max-w-xs mx-auto w-full">
            <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">Dean of IT</div>
            <div className="text-xs text-slate-500 mt-0.5">Department Dean / Verifier (If Required)</div>
          </div>
        </div>
      </div>
    </div>
  );
};