import { RoleLoginForm } from '../RoleLoginForm';
import type { RoleLoginProps } from '../RoleLoginForm';

interface InstructorLoginProps extends RoleLoginProps {
  onInstructorLogin: (schoolId: string, password: string) => Promise<void>;
}

export const InstructorLogin = ({ onNavigate, onInstructorLogin }: InstructorLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Instructor"
    description="Log in with faculty account"
    identityLabel="Faculty ID"
    identityPlaceholder="Enter your ID number"
    identityType="text"
    destination="instructor-session-verification"
    accent="text-[#1d3663]"
    onCredentialsSubmit={onInstructorLogin}
  />
);