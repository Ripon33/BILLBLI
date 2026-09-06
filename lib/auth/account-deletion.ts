import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AccountDeletionInput = {
  authenticatedUserId: string;
};

type DeleteAuthenticatedAccountInput = {
  authenticatedUserId: string;
  deleteUser: (userId: string) => Promise<{ error: unknown | null }>;
  signOut: () => Promise<{ error: unknown | null }>;
};

export function buildAccountDeletionPlan({
  authenticatedUserId,
}: AccountDeletionInput) {
  if (!authenticatedUserId.trim()) {
    throw new Error("Authenticated user is required");
  }

  return {
    userId: authenticatedUserId,
    isAccountDeletion: true,
    isSignOutOnly: false,
    signOutAfterDeletion: true,
    redirectTo: "/sign-in",
  };
}

export async function deleteAuthenticatedAccount({
  authenticatedUserId,
  deleteUser,
  signOut,
}: DeleteAuthenticatedAccountInput) {
  const plan = buildAccountDeletionPlan({ authenticatedUserId });

  const { error } = await deleteUser(plan.userId);

  if (error) {
    throw error;
  }

  const { error: signOutError } = await signOut();

  if (signOutError) {
    throw signOutError;
  }
}

export async function deleteCurrentAccount() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authenticated user is required");
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (error) {
    throw error;
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    throw signOutError;
  }
}

type AdminAccountDeletionInput = {
  authenticatedUserId: string;
  adminDeleteUser: (userId: string) => Promise<{ error: unknown | null }>;
  signOut: () => Promise<{ error: unknown | null }>;
};

export async function deleteAuthenticatedAccountWithAdmin({
  authenticatedUserId,
  adminDeleteUser,
  signOut,
}: AdminAccountDeletionInput) {
  const plan = buildAccountDeletionPlan({ authenticatedUserId });

  const { error } = await adminDeleteUser(plan.userId);

  if (error) {
    throw error;
  }

  const { error: signOutError } = await signOut();

  if (signOutError) {
    throw signOutError;
  }
}
