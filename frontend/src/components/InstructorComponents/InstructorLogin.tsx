import { RoleLoginForm } from '../RoleLoginForm';
import type { RoleLoginProps } from '../RoleLoginForm';

export const InstructorLogin = ({ onNavigate }: RoleLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Instructor"
    description="Log in with faculty account"
    identityLabel="Faculty email"
    identityPlaceholder="Enter your ID number"
    identityType="email"
    destination="instructor-session-verification"
    accent="text-[#1d3663]"
  />
);