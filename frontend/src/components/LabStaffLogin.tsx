import { RoleLoginForm } from './RoleLoginForm';
import type { RoleLoginProps } from './RoleLoginForm';

export const LabStaffLogin = ({ onNavigate }: RoleLoginProps) => (
  <RoleLoginForm
    onNavigate={onNavigate}
    role="Laboratory staff"
    description="Log in with staff account"
    identityLabel="Staff ID"
    identityPlaceholder="Enter your ID Number"
    destination="lab-staff-report-detail"
    accent="text-[#3b5b92]"
  />
);