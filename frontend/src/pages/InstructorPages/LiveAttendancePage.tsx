import { useState } from 'react';
import { CameraScanner, type MatchedStudent } from '../../components/InstructorComponents/CameraScanner';
import { InstructorAttendanceView } from '../../components/InstructorComponents/InstructorViews';
import type { AttendanceEntry, WireframeScreenId } from '../../types';

interface LiveAttendancePageProps {
  attendance: AttendanceEntry[];
  onScanStudent: (entry: AttendanceEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const LiveAttendancePage = ({
  attendance,
  onScanStudent,
  onNavigate,
}: LiveAttendancePageProps) => {
  const [sessionUnlocked, setSessionUnlocked] = useState(true);
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);

  const handleCameraMatch = (
    student: MatchedStudent
  ): { result: 'added' | 'duplicate'; timeIn?: string } => {
    const existing = attendance.find((entry) => entry.studentId === student.studentId);
    if (existing) {
      setLastScannedName(`${student.studentName} (${student.studentId}) is already logged`);
      return { result: 'duplicate', timeIn: existing.timeIn };
    }
    if (!sessionUnlocked) return { result: 'duplicate' };

    const newEntry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      timeIn: student.timeIn,
      studentId: student.studentId,
      name: student.studentName,
      formalName: student.formalName || student.studentName,
      pcNumber: 'None',
      status: 'On-Time',
    };

    onScanStudent(newEntry);
    setLastScannedName(`${student.studentName} (${student.studentId}) logged with no PC assigned`);
    return { result: 'added', timeIn: student.timeIn };
  };

  return (
    <InstructorAttendanceView
      attendance={attendance}
      onScanStudent={onScanStudent}
      onNavigate={onNavigate}
      sessionUnlocked={sessionUnlocked}
      onToggleSession={() => setSessionUnlocked((previous) => !previous)}
      lastScannedName={lastScannedName}
      onStudentLogged={setLastScannedName}
      scanner={<CameraScanner active={sessionUnlocked} onMatched={handleCameraMatch} />}
    />
  );
};
