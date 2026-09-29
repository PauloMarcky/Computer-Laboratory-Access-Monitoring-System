import { RoleLoginForm } from '../RoleLoginForm';
import type { RoleLoginProps } from '../RoleLoginForm';

interface AdminLoginProps extends RoleLoginProps {
  onAdminLogin: (schoolId: string, password: string) => Promise<void>;
}

export const AdminLogin = ({ onNavigate, onAdminLogin }: AdminLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Administrator"
    description="Log in with administrator account"
    identityLabel="Administrator ID"
    identityPlaceholder="Enter your ID number"
    identityType="text"
    destination="admin-schedule-module"
    accent="text-[#15223b]"
    onCredentialsSubmit={onAdminLogin}
  />
);
