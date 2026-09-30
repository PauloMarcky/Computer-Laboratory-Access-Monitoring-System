import { useState } from 'react';
import { CameraScanner, type MatchedStudent } from '../../components/InstructorComponents/CameraScanner';
import { InstructorAttendanceView } from '../../components/InstructorComponents/InstructorViews';
import { getAttendanceStatus, formatAttendanceTime } from '../../utils/attendance-time';
import type { AttendanceEntry, ScheduleEntry, WireframeScreenId } from '../../types';

interface LiveAttendancePageProps {
  attendance: AttendanceEntry[];
  schedule: ScheduleEntry | null;
  token: string; // instructor JWT, needed for the roster-filtered camera scan
  onScanStudent: (entry: AttendanceEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LiveAttendancePage = ({
  attendance,
  schedule,
  token,
  onScanStudent,
  onNavigate,
}: LiveAttendancePageProps) => {
  const [sessionUnlocked, setSessionUnlocked] = useState(true);
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);

  // Only students enrolled in the verified schedule ever reach this callback:
  // the server rejects everyone else before responding.
  const handleCameraMatch = (
    student: MatchedStudent
  ): { result: 'added' | 'duplicate'; timeIn?: string } => {
    const existing = attendance.find((entry) => entry.studentId === student.studentId);
    if (existing) {
      setLastScannedName(`${student.studentName} (${student.studentId}) is already logged`);
      return { result: 'duplicate', timeIn: existing.timeIn };
    }
    if (!sessionUnlocked) return { result: 'duplicate' };

    const now = new Date();
    const newEntry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      timeIn: formatAttendanceTime(now),
      studentId: student.studentId,
      name: student.studentName,
      formalName: student.formalName || student.studentName,
      pcNumber: 'None',
      status: schedule
        ? getAttendanceStatus(now, schedule.startTime, schedule.endTime)
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
      onNavigate={onNavigate}
      sessionUnlocked={sessionUnlocked}
      onToggleSession={() => setSessionUnlocked((previous) => !previous)}
      lastScannedName={lastScannedName}
      onStudentLogged={setLastScannedName}
      scanner={
        <CameraScanner
          active={sessionUnlocked && !!schedule && !!token}
          scheduleId={schedule?.id ?? ''}
          subject={schedule?.subject}
          token={token}
          onMatched={handleCameraMatch}
        />
      }
    />
  );
};