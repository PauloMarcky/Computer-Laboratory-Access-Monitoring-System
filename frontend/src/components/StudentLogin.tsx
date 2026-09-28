import { RoleLoginForm } from './RoleLoginForm';
import type { RoleLoginProps } from './RoleLoginForm';

interface StudentLoginProps extends RoleLoginProps {
  onStudentLogin: (studentId: string) => void;
}

export const StudentLogin = ({ onNavigate, onStudentLogin }: StudentLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Student"
    description="Log in with student account"
    identityLabel="Student ID"
    identityPlaceholder="Enter your student ID"
    destination="student-claim-pc"
    accent="text-[#9c7d2d]"
    onIdentitySubmit={onStudentLogin}
  />
);