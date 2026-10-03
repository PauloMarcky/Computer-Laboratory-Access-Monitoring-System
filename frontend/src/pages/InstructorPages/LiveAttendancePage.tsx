import { useState } from 'react';
import { CameraScanner, type MatchedStudent } from '../../components/InstructorComponents/CameraScanner';
import { InstructorAttendanceView } from '../../components/InstructorComponents/InstructorViews';
import { getAttendanceStatus, formatAttendanceTime } from '../../utils/attendance-time';
import type { AttendanceEntry, ScheduleEntry, WireframeScreenId } from '../../types';

interface LiveAttendancePageProps {
  attendance: AttendanceEntry[];
  schedule: ScheduleEntry | null;
  activeSessionId: string;
  token: string; // instructor JWT, needed for the roster-filtered camera scan
  onScanStudent: (entry: AttendanceEntry) => void;
  onManualStudent: (schoolId: string) => Promise<AttendanceEntry>;
  onEndSession: () => Promise<void>;
  onNavigate: (screen: WireframeScreenId) => void;
  onLogout?: () => void | Promise<void>;
}

export const LiveAttendancePage = ({
  attendance,
  schedule,
  activeSessionId,
  token,
  onScanStudent,
  onManualStudent,
  onEndSession,
  onNavigate,
  onLogout,
}: LiveAttendancePageProps) => {
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);

  // Only students enrolled in the verified schedule ever reach this callback:
  // the server rejects everyone else before responding.
  const handleCameraMatch = (
    student: MatchedStudent
  ): { result: 'added' | 'duplicate'; timeIn?: string } => {
    const existing = attendance.find((entry) => entry.studentId === student.studentId);
    if (existing || student.alreadyLogged) {
      setLastScannedName(`${student.studentName} (${student.studentId}) is already logged`);
      return { result: 'duplicate', timeIn: existing?.timeIn || formatAttendanceTime(new Date(student.timeIn)) };
    }
    const timeIn = new Date(student.timeIn);
    const newEntry: AttendanceEntry = {
      id: String(student.attendanceId || `att-${Date.now()}`),
      timeIn: formatAttendanceTime(timeIn),
      studentId: student.studentId,
      name: student.studentName,
      formalName: student.formalName || student.studentName,
      pcNumber: 'None',
      status: schedule
        ? getAttendanceStatus(timeIn, schedule.startTime, schedule.endTime)
        : 'On-Time',
    };

    onScanStudent(newEntry);
    setLastScannedName(`${student.studentName} (${student.studentId}) logged with no PC assigned`);
    return { result: 'added', timeIn: newEntry.timeIn };
  };

  return (
    <InstructorAttendanceView
      attendance={attendance}
      schedule={schedule}
      onScanStudent={onScanStudent}
      onManualStudent={onManualStudent}
      onEndSession={onEndSession}
      onNavigate={onNavigate}
      onLogout={onLogout}
      lastScannedName={lastScannedName}
      onStudentLogged={setLastScannedName}
      scanner={
        <CameraScanner
          active={!!schedule && !!activeSessionId && !!token}
          scheduleId={schedule?.id ?? ''}
          activeSessionId={activeSessionId}
          subject={schedule?.subject}
          token={token}
          onMatched={handleCameraMatch}
        />
      }
    />
  );
};