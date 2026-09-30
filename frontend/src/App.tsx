/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import {
  AttendanceEntry,
  ClassReportSubmission,
  PCIssueReport,
  PCStation,
  ScheduleEntry,
  ScheduleInstructorOption,
  ScheduleLabRoomOption,
  WireframeScreenId,
} from './types';
import { API_BASE_URL, readApiResponse } from './api';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { AdminLogin } from './components/AdminComponents/AdminLogin';
import { InstructorLogin } from './components/InstructorComponents/InstructorLogin';
import { LabStaffLogin } from './components/CustodianComponents/LabStaffLogin';
import { StudentLogin } from './components/StudentComponents/StudentLogin';
import { LiveAttendancePage } from './pages/InstructorPages/LiveAttendancePage';
import { InstructorSessionVerificationPage } from './pages/InstructorPages/InstructorSessionVerificationPage';
import { ExportAttendancePage } from './pages/InstructorPages/ExportAttendancePage';
import { StudentClaimPCView } from './pages/StudentPages/PCAssignment';
import { StudentReportIssueView } from './pages/StudentPages/PCFeedbackReport';
import { LabStaffReportDetailView } from './pages/CustodianPages.tsx/ComputerReport';
import { LabStaffReportExportView } from './pages/CustodianPages.tsx/ExportReport';
import { LabStaffRecordsView, LabStaffRoomsView } from './pages/CustodianPages.tsx/LaboratoriesActivity';
import { AdminScheduleAddView, AdminScheduleModuleView } from './pages/AdminPages/ScheduleManager';
import { AdminTeacherWorkloadView } from './pages/AdminPages/InstructorWorkload';
import { AdminReportsDashboardView } from './pages/AdminPages/ClassReports';
import { AdminStudentsAnalyticsView } from './pages/AdminPages/AnalyticsReport';
import { UserManagement } from './pages/AdminPages/UserManagement';
import { SubjectManagerView } from './pages/AdminPages/SubjectManager';
import { ManageRosterView } from './pages/AdminPages/ManageRosterPage';

interface ApiSchedule {
  id: number;
  instructorId: number;
  labRoomId: number;
  subjectCode: string;
  section: string;
  yearLevel: number;
  termId: number | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  instructor: ScheduleInstructorOption;
  labRoom: ScheduleLabRoomOption;
  term?: {
    id: number;
    academicYear: string;
    semester: string;
    isActive: boolean;
  } | null;
}

const apiDayToShort: Record<string, ScheduleEntry['day']> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sat',
};

const shortDayToApi: Record<ScheduleEntry['day'], string> = {
  Mon: 'MONDAY',
  Tue: 'TUESDAY',
  Wed: 'WEDNESDAY',
  Thu: 'THURSDAY',
  Fri: 'FRIDAY',
  Sat: 'SATURDAY',
};

const apiTimeToDisplay = (value: string) => {
  const date = new Date(value);
  const hour = date.getUTCHours();
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${period}`;
};

const displayTimeToApi = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error('Enter a valid start and end time.');
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const mapApiSchedule = (schedule: ApiSchedule): ScheduleEntry => ({
  id: String(schedule.id),
  instructorId: schedule.instructorId,
  labRoomId: schedule.labRoomId,
  day: apiDayToShort[schedule.dayOfWeek] || 'Mon',
  startTime: apiTimeToDisplay(schedule.startTime),
  endTime: apiTimeToDisplay(schedule.endTime),
  subject: schedule.subjectCode,
  teacher: `${schedule.instructor.firstName} ${schedule.instructor.lastName}`,
  room: schedule.labRoom.roomName,
  department: schedule.instructor.department || '',
  semester: schedule.term ? `${schedule.term.academicYear} ${schedule.term.semester}` : '',
  colorTheme: 'blue',
  termId: schedule.termId,
  section: schedule.section,
  yearLevel: schedule.yearLevel,
} as ScheduleEntry);

const addTwoHours = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '04:00 PM';

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  const startMinutes = hour * 60 + Number(match[2]);
  const endMinutes = Math.min(startMinutes + 120, 23 * 60 + 59);
  const endHour = Math.floor(endMinutes / 60);
  const period = endHour >= 12 ? 'PM' : 'AM';
  return `${String(endHour % 12 || 12).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')} ${period}`;
};

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
      id: 'instructor-session-verification',
      label: 'Instructor session verification',
      roleGroup: 'Instructor',
    },
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
    { id: 'admin-user-management', label: 'Admin user management', roleGroup: 'Admin' },
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
  const [activeInstructorSchedule, setActiveInstructorSchedule] = useState<ScheduleEntry | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [rosterSchedule, setRosterSchedule] = useState<ScheduleEntry | null>(null);
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem('clams.adminToken') || ''
  );
  const [instructorToken, setInstructorToken] = useState(
    () => localStorage.getItem('clams.instructorToken') || ''
  );
  const [scheduleInstructors, setScheduleInstructors] = useState<ScheduleInstructorOption[]>([]);
  const [scheduleLabRooms, setScheduleLabRooms] = useState<ScheduleLabRoomOption[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    if (currentScreen === 'login-portal') {
      localStorage.removeItem('clams.adminToken');
      localStorage.removeItem('clams.instructorToken');
      setAdminToken('');
      setInstructorToken('');
    }
  }, [currentScreen]);

  useEffect(() => {
    if (!adminToken) return;
    let active = true;

    const loadScheduleData = async () => {
      setIsLoadingSchedules(true);
      setScheduleError('');
      try {
        const headers = { Authorization: `Bearer ${adminToken}` };
        const [scheduleResponse, instructorResponse, roomResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/schedules`, { headers }),
          fetch(`${API_BASE_URL}/instructors`, { headers }),
          fetch(`${API_BASE_URL}/lab-rooms`, { headers }),
        ]);
        const [scheduleResult, instructorResult, roomResult] = await Promise.all([
          readApiResponse<{ error?: string; schedules: ApiSchedule[] }>(scheduleResponse),
          readApiResponse<{ error?: string; instructors: ScheduleInstructorOption[] }>(instructorResponse),
          readApiResponse<{ error?: string; labRooms: ScheduleLabRoomOption[] }>(roomResponse),
        ]);
        for (const [response, result] of [
          [scheduleResponse, scheduleResult],
          [instructorResponse, instructorResult],
          [roomResponse, roomResult],
        ] as const) {
          if (!response.ok) throw new Error(result.error || 'Unable to load schedule data.');
        }
        if (!active) return;
        setSchedules(scheduleResult.schedules.map(mapApiSchedule));
        setScheduleInstructors(instructorResult.instructors);
        setScheduleLabRooms(roomResult.labRooms);
      } catch (error) {
        if (active) setScheduleError(error instanceof Error ? error.message : 'Unable to load schedule data.');
      } finally {
        if (active) setIsLoadingSchedules(false);
      }
    };

    void loadScheduleData();
    return () => { active = false; };
  }, [adminToken]);

  const handleAdminLogin = async (schoolId: string, password: string) => {
    await handleRoleLogin('ADMIN', schoolId, password);
  };

  const handleRoleLogin = async (
    expectedRole: 'ADMIN' | 'INSTRUCTOR' | 'CUSTODIAN' | 'STUDENT',
    schoolId: string,
    password: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, password }),
    });
    const result = await readApiResponse<{
      error?: string;
      token?: string;
      user?: { role?: string };
    }>(response);
    if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
    if (result.user?.role !== expectedRole || typeof result.token !== 'string') {
      throw new Error(`These credentials are not for the ${expectedRole.toLowerCase()} portal.`);
    }

    if (expectedRole === 'INSTRUCTOR') {
      const scheduleResponse = await fetch(`${API_BASE_URL}/schedules`, {
        headers: { Authorization: `Bearer ${result.token}` },
      });
      const scheduleResult = await readApiResponse<{ error?: string; schedules: ApiSchedule[] }>(scheduleResponse);
      if (!scheduleResponse.ok) throw new Error(scheduleResult.error || 'Unable to load your class schedule.');
      setSchedules(scheduleResult.schedules.map(mapApiSchedule));
    }

    if (expectedRole === 'ADMIN') {
      localStorage.setItem('clams.adminToken', result.token);
      setAdminToken(result.token);
    } else {
      localStorage.removeItem('clams.adminToken');
      setAdminToken('');
    }

    if (expectedRole === 'INSTRUCTOR') {
      localStorage.setItem('clams.instructorToken', result.token);
      setInstructorToken(result.token);
    } else {
      localStorage.removeItem('clams.instructorToken');
      setInstructorToken('');
    }
    setActiveInstructorSchedule(null);

    if (expectedRole === 'STUDENT') {
      setCurrentStudentId(schoolId);
      setSelectedPc('');
      setIsClaimedConfirmed(false);
    }

    const roleHome: Record<typeof expectedRole, WireframeScreenId> = {
      ADMIN: 'admin-schedule-module',
      INSTRUCTOR: 'instructor-session-verification',
      CUSTODIAN: 'lab-staff-report-detail',
      STUDENT: 'student-claim-pc',
    };
    setCurrentScreen(roleHome[expectedRole]);
  };

  const handleInstructorLogin = (schoolId: string, password: string) =>
    handleRoleLogin('INSTRUCTOR', schoolId, password);

  const handleCustodianLogin = (schoolId: string, password: string) =>
    handleRoleLogin('CUSTODIAN', schoolId, password);

  const handleStudentLogin = (schoolId: string, password: string) =>
    handleRoleLogin('STUDENT', schoolId, password);

  const handleStartInstructorAttendance = (schedule: ScheduleEntry) => {
    setActiveInstructorSchedule(schedule);
    setCurrentScreen('instructor-attendance-module');
  };

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

  const handleSubmitPcIssue = (
    category: PCIssueReport['category'],
    description: string
  ) => {
    const newIssue: PCIssueReport = {
      id: `iss-${Date.now()}`,
      pcNumber: `PC-${selectedPc}`,
      labRoom: '',
      studentId: currentStudentId,
      category,
      description,
      submittedAt: 'Just now',
      status: 'Open',
    };
    setPcIssueReports((prev) => [newIssue, ...prev]);
  };

  const handleMarkPcIssueFixed = (reportId: string) => {
    setPcIssueReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, status: 'Resolved', resolvedAt: new Date().toLocaleString() }
          : report
      )
    );
  };

  const handleSavePcIssueReport = (reportId: string, custodianReport: string) => {
    setPcIssueReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, custodianReport } : report
      )
    );
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
    setEditingSchedule({
      id: '',
      instructorId: 0,
      labRoomId: 0,
      day,
      startTime,
      endTime: addTwoHours(startTime),
      subject: '',
      teacher: '',
      room: '',
      department: '',
      semester: '',
      colorTheme: 'blue',
      termId: null,
      section: 'A',
      yearLevel: 1,
    } as ScheduleEntry);
    setCurrentScreen('admin-schedule-add-module');
  };

  const handleSaveSchedule = async (entry: ScheduleEntry) => {
    const isUpdate = /^\d+$/.test(entry.id) && Number(entry.id) > 0;
    const dayOfWeek = shortDayToApi[entry.day];

    // Cast to read the extra fields we added in the form
    const extended = entry as ScheduleEntry & {
      termId?: number | null;
      section?: string;
      yearLevel?: number;
    };

    const response = await fetch(
      isUpdate ? `${API_BASE_URL}/schedules/${entry.id}` : `${API_BASE_URL}/schedules`,
      {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          instructorId: entry.instructorId,
          labRoomId: entry.labRoomId,
          subjectCode: entry.subject.trim(),
          dayOfWeek,
          startTime: displayTimeToApi(entry.startTime),
          endTime: displayTimeToApi(entry.endTime),
          termId: extended.termId ?? null,
          section: extended.section ?? 'A',
          yearLevel: extended.yearLevel ?? 1,
        }),
      }
    );
    const result = await readApiResponse<{ error?: string; schedule: ApiSchedule }>(response);
    if (!response.ok) throw new Error(result.error || 'Unable to save schedule.');
    const savedSchedule = mapApiSchedule(result.schedule);
    setSchedules((current) =>
      isUpdate
        ? current.map((schedule) => (schedule.id === savedSchedule.id ? savedSchedule : schedule))
        : [...current, savedSchedule]
    );
    setScheduleError('');
  };

  const handleManageRoster = (entry: ScheduleEntry) => {
    setRosterSchedule(entry);
    setCurrentScreen('admin-schedule-roster');
  };

  const handleDeleteSchedule = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!response.ok) {
      const result = await readApiResponse<{ error?: string }>(response);
      throw new Error(result.error || 'Unable to delete schedule.');
    }
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setScheduleError('');
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
          <InstructorLogin onNavigate={setCurrentScreen} onInstructorLogin={handleInstructorLogin} />
        )}

        {currentScreen === 'instructor-session-verification' && (
          <InstructorSessionVerificationPage
            schedules={schedules}
            onStartAttendance={handleStartInstructorAttendance}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-login' && (
          <LabStaffLogin onNavigate={setCurrentScreen} onCustodianLogin={handleCustodianLogin} />
        )}

        {currentScreen === 'student-login' && (
          <StudentLogin onNavigate={setCurrentScreen} onStudentLogin={handleStudentLogin} />
        )}

        {currentScreen === 'admin-login' && (
          <AdminLogin onNavigate={setCurrentScreen} onAdminLogin={handleAdminLogin} />
        )}

        {currentScreen === 'instructor-attendance-module' && (
          <LiveAttendancePage
            attendance={attendance}
            schedule={activeInstructorSchedule}
            token={instructorToken}
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
            reports={pcIssueReports.filter((report) => report.studentId === currentStudentId)}
            onSubmitIssue={handleSubmitPcIssue}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-report-detail' && (
          <LabStaffReportDetailView
            selectedReport={activeReport}
            onUpdateReportStatus={handleUpdateReportStatus}
            pcIssueReports={pcIssueReports}
            onMarkPcIssueFixed={handleMarkPcIssueFixed}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'lab-staff-report-export' && (
          <LabStaffReportExportView
            reports={pcIssueReports}
            onSaveCustodianReport={handleSavePcIssueReport}
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
            isLoading={isLoadingSchedules}
            error={scheduleError}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-schedule-add-module' && (
          <AdminScheduleAddView
            editingSchedule={editingSchedule}
            instructors={scheduleInstructors}
            labRooms={scheduleLabRooms}
            error={scheduleError}
            token={adminToken}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onManageRoster={handleManageRoster}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-teacher-workload' && (
          <AdminTeacherWorkloadView
            token={adminToken}
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

        {currentScreen === 'admin-user-management' && (
          <UserManagement
            adminToken={adminToken}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin-subjects' && (
          <SubjectManagerView token={adminToken} onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'admin-schedule-roster' && (
          <ManageRosterView
            schedule={rosterSchedule}
            token={adminToken}
            onNavigate={setCurrentScreen}
          />
        )}
      </div>
    </div>
  );
}
