import { InstructorSessionCheck } from '../../components/InstructorComponents/InstructorSessionCheck';
import type { ScheduleEntry, WireframeScreenId } from '../../types';

interface InstructorSessionVerificationPageProps {
  schedules: ScheduleEntry[];
  onNavigate: (screen: WireframeScreenId) => void;
}

export const InstructorSessionVerificationPage = ({ schedules, onNavigate }: InstructorSessionVerificationPageProps) => (
  <InstructorSessionCheck schedules={schedules} onNavigate={onNavigate} />
);