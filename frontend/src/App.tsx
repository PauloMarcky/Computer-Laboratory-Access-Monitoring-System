/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import {
  AttendanceEntry,
  ClassReportSubmission,
  PCIssueReport,
  PCStation,
  ScheduleEntry,
  WireframeScreenId,
} from './types';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { AdminLogin } from './components/AdminLogin';
import { InstructorLogin } from './components/InstructorLogin';
import { LabStaffLogin } from './components/LabStaffLogin';
import { StudentLogin } from './components/StudentLogin';
import { LiveAttendancePage } from './pages/InstructorPages/LiveAttendancePage';
import { ExportAttendancePage } from './pages/InstructorPages/ExportAttendancePage';
import { StudentClaimPCView, StudentReportIssueView } from './components/StudentViews';
import {
  LabStaffRecordsView,
  LabStaffReportDetailView,
  LabStaffReportExportView,
  LabStaffRoomsView,
} from './components/LabStaffViews';
import {
  AdminReportsDashboardView,
  AdminScheduleAddView,
  AdminScheduleModuleView,
  AdminStudentsAnalyticsView,
  AdminTeacherWorkloadView,
} from './components/AdminViews';

const WIREFRAME_SCREENS: Array<{
  id: WireframeScreenId;
  label: string;
  roleGroup: string;
}> = [
    { id: 'login-portal', label: '1. login-portal', roleGroup: 'Portal' },
    { id: 'instructor-login', label: 'Instructor login', roleGroup: 'Instructor' },
    { id: 'lab-staff-login', label: 'Lab staff login', roleGroup: 'Lab Staff' },
    { id: 'student-login', label: 'Student login', roleGroup: 'Student' },
    { id: 'admin-login', label: 'Administrator login', roleGroup: 'Admin' },
    {
      id: 'instructor-attendance-module',
      label: '2. instructor-attendance-module',
      roleGroup: 'Instructor',
    },
    {
      id: 'instructor-attendance-export',
      label: '3. instructor-attendance-export',
      roleGroup: 'Instructor',
    },
    { id: 'student-claim-pc', label: '4. student-claim-pc', roleGroup: 'Student' },
    { id: 'student-report-issue', label: '5. student-report-issue', roleGroup: 'Student' },
    {
      id: 'lab-staff-report-detail',
      label: '6. lab-staff-report-detail',
      roleGroup: 'Lab Staff',
    },
    {
      id: 'lab-staff-report-export',
      label: '7. lab-staff-report-export',
      roleGroup: 'Lab Staff',
    },
    {
      id: 'lab-staff-records-module',
      label: '8. lab-staff-records-module',
      roleGroup: 'Lab Staff',
    },
    {
      id: 'lab-staff-rooms-module',
      label: '9. lab-staff-rooms-module',
      roleGroup: 'Lab Staff',
    },
    { id: 'admin-schedule-module', label: '10. admin-schedule-module', roleGroup: 'Admin' },
    {
      id: 'admin-schedule-add-module',
      label: '11. admin-schedule-add-module',
      roleGroup: 'Admin',
    },
    {
      id: 'admin-teacher-workload',
      label: '12. admin-teacher-workload',
      roleGroup: 'Admin',
    },
    {
      id: 'admin-reports-dashboard',
      label: '13. admin-reports-dashboard',
      roleGroup: 'Admin',
    },
    {
      id: 'admin-students-analytics',
      label: '14. admin-students-analytics',
      roleGroup: 'Admin',
    },
  ];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<WireframeScreenId>('login-portal');

  // Instructor Live Attendance State
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);

  // Student Seat Claim & Issue Reports State
  const [pcStations, setPcStations] = useState<PCStation[]>([]);
  const [selectedPc, setSelectedPc] = useState<string>('');
  const [isClaimedConfirmed, setIsClaimedConfirmed] = useState<boolean>(false);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [pcIssueReports, setPcIssueReports] = useState<PCIssueReport[]>([]);

  // Lab Staff & Admin Reports State
  const [classReports, setClassReports] = useState<ClassReportSubmission[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  // Admin Schedule State
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);

  const handleScanStudent = (newEntry: AttendanceEntry) => {
    const entryWithClaimedPc =
      newEntry.studentId === currentStudentId && isClaimedConfirmed && selectedPc
        ? { ...newEntry, pcNumber: `PC-${selectedPc}` }
        : newEntry;
    setAttendance((prev) => [...prev, entryWithClaimedPc]);
  };

  const handleSelectPc = (pcNumber: string) => {
    if (selectedPc !== pcNumber && isClaimedConfirmed) {
      setIsClaimedConfirmed(false);
      if (currentStudentId) {
        setAttendance((prev) =>
          prev.map((entry) =>
            entry.studentId === currentStudentId ? { ...entry, pcNumber: 'None' } : entry
          )
        );
      }
    }
    setSelectedPc(pcNumber);
    setPcStations((prev) =>
      prev.map((pc) => {
        if (pc.number === pcNumber) {
          return {
            ...pc,
            status: 'you',
          };
        }
        if (pc.status === 'you') {
          return {
            ...pc,
            status: 'free',
            occupantName: undefined,
            occupantId: undefined,
          };
        }
        return pc;
      })
    );
  };

  const handleConfirmClaim = () => {
    if (!selectedPc) return;
    const isClaiming = !isClaimedConfirmed;
    setIsClaimedConfirmed(isClaiming);
    if (currentStudentId) {
      setAttendance((prev) =>
        prev.map((entry) =>
          entry.studentId === currentStudentId
            ? { ...entry, pcNumber: isClaiming ? `PC-${selectedPc}` : 'None' }
            : entry
        )
      );
    }
  };

  const handleStudentLogin = (studentId: string) => {
    setCurrentStudentId(studentId);
    setSelectedPc('');
    setIsClaimedConfirmed(false);
    setCurrentScreen('student-claim-pc');
  };

  const handleSubmitPcIssue = (
    category: PCIssueReport['category'],
    description: string
  ) => {
    const newIssue: PCIssueReport = {
      id: `iss-${Date.now()}`,
      pcNumber: `PC-${selectedPc}`,
      labRoom: '',
      studentId: '',
      category,
      description,
      submittedAt: 'Just now',
      status: 'Open',
    };
    setPcIssueReports((prev) => [newIssue, ...prev]);
  };

  const handleUpdateReportStatus = (
    reportId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    remarks: string
  ) => {
    setClassReports((prev) =>
      prev.map((rep) => (rep.id === reportId ? { ...rep, status, remarks } : rep))
    );
  };

  const handleEditSchedule = (entry: ScheduleEntry) => {
    setEditingSchedule(entry);
    setCurrentScreen('admin-schedule-add-module');
  };

  const handleCreateNewSchedule = (
    day: ScheduleEntry['day'] = 'Mon',
    startTime = '02:00 PM'
  ) => {
    const startIdx = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'].indexOf(
      startTime
    );
    const endTimes = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    const endTime = startIdx >= 0 ? endTimes[startIdx] : '04:00 PM';

    setEditingSchedule({
      id: `sch-${Date.now()}`,
      day,
      startTime,
      endTime,
      subject: '',
      teacher: '',
      room: '',
      department: '',
      semester: '',
      colorTheme: 'blue',
    });
    setCurrentScreen('admin-schedule-add-module');
  };

  const handleSaveSchedule = (entry: ScheduleEntry) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === entry.id);
      if (exists) {
        return prev.map((s) => (s.id === entry.id ? entry : s));
      }
      // Replace any existing slot on same day + startTime or append
      const withoutConflict = prev.filter(
        (s) => !(s.day === entry.day && s.startTime === entry.startTime)
      );
      return [...withoutConflict, entry];
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const activeReport = classReports.find((r) => r.id === selectedReportId);

  const currentIdx = WIREFRAME_SCREENS.findIndex((s) => s.id === currentScreen);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">


      {/* Main Active Screen */}
      <div className="flex-1">
        {currentScreen === 'login-portal' && (
          <RoleSelectionPage onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'instructor-login' && (
          <InstructorLogin onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'lab-staff-login' && (
          <LabStaffLogin onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'student-login' && (
          <StudentLogin onNavigate={setCurrentScreen} onStudentLogin={handleStudentLogin} />
        )}

        {currentScreen === 'admin-login' && (
          <AdminLogin onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'instructor-attendance-module' && (
          <LiveAttendancePage
            attendance={attendance}
            onScanStudent={handleScanStudent}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'instructor-attendance-export' && (
          <ExportAttendancePage attendance={attendance} onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'student-claim-pc' && (
          <StudentClaimPCView
            stations={pcStations}
            selectedPc={selectedPc}
            isClaimedConfirmed={isClaimedConfirmed}
            onSelectPc={handleSelectPc}
            onConfirmClaim={handleConfirmClaim}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'student-report-issue' && (
          <StudentReportIssueView
            selectedPc={selectedPc}
            reports={pcIssueReports}
            onSubmitIssue={handleSubmitPcIssue}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-report-detail' && (
          <LabStaffReportDetailView
            selectedReport={activeReport}
            onUpdateReportStatus={handleUpdateReportStatus}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-report-export' && (
          <LabStaffReportExportView
            attendance={activeReport?.attendanceList || attendance}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-records-module' && (
          <LabStaffRecordsView
            records={[]}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-rooms-module' && (
          <LabStaffRoomsView
            rooms={[]}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-schedule-module' && (
          <AdminScheduleModuleView
            schedules={schedules}
            onEditSchedule={handleEditSchedule}
            onCreateNewSchedule={handleCreateNewSchedule}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-schedule-add-module' && (
          <AdminScheduleAddView
            editingSchedule={editingSchedule}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-teacher-workload' && (
          <AdminTeacherWorkloadView
            workloads={[]}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-reports-dashboard' && (
          <AdminReportsDashboardView
            reports={classReports}
            onSelectReport={(rep) => setSelectedReportId(rep.id)}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-students-analytics' && (
          <AdminStudentsAnalyticsView onNavigate={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}
