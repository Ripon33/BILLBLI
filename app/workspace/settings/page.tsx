import AccountSettings from "@/components/AccountSettings";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";

export default function SettingsPage() {
  return (
    <WorkspaceDestination
      title="Settings"
      description="Manage your BILLBLI account and account-level settings."
    >
      <AccountSettings />
    </WorkspaceDestination>
  );
}
