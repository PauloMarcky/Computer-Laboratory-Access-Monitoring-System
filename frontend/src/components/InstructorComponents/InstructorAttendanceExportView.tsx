import { ArrowLeft, Printer } from 'lucide-react';
import type { AttendanceEntry, WireframeScreenId } from '../../types';

interface InstructorAttendanceExportViewProps {
  attendance: AttendanceEntry[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const InstructorAttendanceExportView = ({
  attendance,
  onNavigate,
}: InstructorAttendanceExportViewProps) => (
  <div className="min-h-[calc(100vh-44px)] bg-white py-8 px-6">
    <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 no-print">
      <button
        type="button"
        onClick={() => onNavigate('instructor-attendance-module')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#1b325f] cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-sm md:text-base">Back</span>
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#1b325f] hover:bg-[#142547] text-white text-xs font-semibold cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print Official Log</span>
      </button>
    </div>

    <div className="max-w-4xl mx-auto bg-white px-4 sm:px-8 py-6">
      <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h1 className="text-base font-bold tracking-wide text-slate-900 uppercase">
          UNIVERSITY OF LA SALETTE, INC.
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Santiago City, Isabela</p>
        <p className="text-xs font-bold tracking-wider text-slate-800 uppercase mt-3">
          COLLEGE OF INFORMATION TECHNOLOGY — COMPUTER LAB ATTENDANCE LOG
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-800 mb-5">
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
        <table className="w-full text-left border-collapse text-xs">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-16 pt-4 text-center text-xs">
        <div className="max-w-xs mx-auto w-full">
          <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">—</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Class Instructor Signature &amp; Date</div>
        </div>
        <div className="max-w-xs mx-auto w-full">
          <div className="border-t border-slate-700 pt-2 font-bold text-slate-900">Dean of IT</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Department Dean / Verifier (If Required)</div>
        </div>
      </div>
    </div>
  </div>
);