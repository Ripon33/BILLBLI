import ProfileWorkspace from "@/components/ProfileWorkspace";
import { WorkspaceDestination } from "@/components/WorkspaceDestination";
import { requireUser } from "@/lib/supabase/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <WorkspaceDestination
      title="Profile"
      description="View your authenticated BILLBLI account profile."
    >
      <ProfileWorkspace
        user={{
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        }}
      />
    </WorkspaceDestination>
  );
}
