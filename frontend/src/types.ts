export type WireframeScreenId =
  | 'login-portal'
  | 'instructor-login'
  | 'lab-staff-login'
  | 'student-login'
  | 'admin-login'
  | 'instructor-session-verification'
  | 'instructor-attendance-module'
  | 'instructor-attendance-export'
  | 'student-claim-pc'
  | 'student-report-issue'
  | 'lab-staff-report-detail'
  | 'lab-staff-report-export'
  | 'lab-staff-records-module'
  | 'lab-staff-rooms-module'
  | 'admin-schedule-module'
  | 'admin-schedule-add-module'
  | 'admin-teacher-workload'
  | 'admin-reports-dashboard'
  | 'admin-students-analytics';

export interface AttendanceEntry {
  id: string;
  timeIn: string;
  studentId: string;
  name: string;
  formalName: string;
  pcNumber: string;
  status: 'On-Time' | 'Late';
  signed?: boolean;
}

export interface PCStation {
  number: string;
  status: 'occupied' | 'free' | 'you';
  occupantName?: string;
  occupantId?: string;
  hasIssue?: boolean;
  issueCategory?: string;
  issueDescription?: string;
}

export interface PCIssueReport {
  id: string;
  pcNumber: string;
  labRoom: string;
  studentId: string;
  category: 'Mouse / Keyboard' | 'Monitor' | 'No Power' | 'No Network' | 'Software' | 'Other';
  description: string;
  submittedAt: string;
  status: 'Open' | 'Resolved';
}

export interface LabUsageRecord {
  id: string;
  date: string;
  timeslot: string;
  laboratory: string;
  subject: string;
  instructor: string;
  section: string;
  yearLevel: string;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  academicYear: string;
  semester: string;
}

export interface LabRoomStatus {
  id: string;
  name: string;
  location: string;
  status: 'IN USE' | 'AVAILABLE' | 'MAINTENANCE';
  subject?: string;
  instructor?: string;
  section?: string;
  timeslot?: string;
  availablePcs: number;
  occupiedPcs: number;
  totalPcs: number;
}

export interface ScheduleEntry {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  department: string;
  semester: string;
  colorTheme: 'blue' | 'green' | 'amber' | 'purple';
}

export interface TeacherWorkload {
  id: string;
  name: string;
  department: string;
  assignedSubjects: string[];
  totalHours: number;
  status: 'Available' | 'Full Load' | 'On Leave';
  weeklyBreakdown: {
    Monday?: { title: string; detail: string };
    Tuesday?: { title: string; detail: string };
    Wednesday?: { title: string; detail: string };
    Thursday?: { title: string; detail: string };
    Friday?: { title: string; detail: string };
  };
}

export interface ClassReportSubmission {
  id: string;
  date: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  labRoom: string;
  sessionTime: string;
  semester: string;
  studentsPresent: number;
  studentsTotal: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  attendanceList: AttendanceEntry[];
}
