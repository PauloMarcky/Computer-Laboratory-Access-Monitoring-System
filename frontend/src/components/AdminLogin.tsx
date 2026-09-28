import { RoleLoginForm } from './RoleLoginForm';
import type { RoleLoginProps } from './RoleLoginForm';

export const AdminLogin = ({ onNavigate }: RoleLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Administrator"
    description="Log in with administrator account"
    identityLabel="Administrator email"
    identityPlaceholder="Enter your ID number"
    identityType="email"
    destination="admin-schedule-module"
    accent="text-[#15223b]"
  />
);
