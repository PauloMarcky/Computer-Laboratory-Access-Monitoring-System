import { InstructorSessionCheck } from '../../components/InstructorComponents/InstructorSessionCheck';
import type { ScheduleEntry, WireframeScreenId } from '../../types';

interface InstructorSessionVerificationPageProps {
  schedules: ScheduleEntry[];
  onStartAttendance: (schedule: ScheduleEntry) => void;
  onNavigate: (screen: WireframeScreenId) => void;
}

export const InstructorSessionVerificationPage = ({ schedules, onStartAttendance, onNavigate }: InstructorSessionVerificationPageProps) => (
  <InstructorSessionCheck schedules={schedules} onStartAttendance={onStartAttendance} onNavigate={onNavigate} />
);