import { InstructorSessionCheck } from '../../components/InstructorComponents/InstructorSessionCheck';
import type { ScheduleEntry, WireframeScreenId } from '../../types';

interface InstructorSessionVerificationPageProps {
  schedules: ScheduleEntry[];
  onStartAttendance: (schedule: ScheduleEntry) => Promise<void>;
  onNavigate: (screen: WireframeScreenId) => void;
  onLogout?: () => void | Promise<void>;
}

export const InstructorSessionVerificationPage = ({ schedules, onStartAttendance, onNavigate, onLogout }: InstructorSessionVerificationPageProps) => (
  <InstructorSessionCheck schedules={schedules} onStartAttendance={onStartAttendance} onNavigate={onNavigate} onLogout={onLogout} />
);