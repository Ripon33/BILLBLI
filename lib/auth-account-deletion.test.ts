import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { buildAccountDeletionPlan, deleteAuthenticatedAccount } from "./auth/account-deletion";

describe("account deletion", () => {
  it("requires the authenticated user id", () => {
    expect(() =>
      buildAccountDeletionPlan({
        authenticatedUserId: " ",
      }),
    ).toThrow(/Authenticated user is required/);
  });

  it("targets only the authenticated account", () => {
    const plan = buildAccountDeletionPlan({
      authenticatedUserId: "auth-user-123",
    });

    expect(plan.userId).toBe("auth-user-123");
    expect(plan.userId).not.toBe("client-user-456");
  });

  it("terminates the session after account deletion", () => {
    const plan = buildAccountDeletionPlan({
      authenticatedUserId: "auth-user-123",
    });

    expect(plan.signOutAfterDeletion).toBe(true);
    expect(plan.redirectTo).toBe("/sign-in");
  });

  it("does not treat sign out as account deletion", () => {
    const plan = buildAccountDeletionPlan({
      authenticatedUserId: "auth-user-123",
    });

    expect(plan.isAccountDeletion).toBe(true);
    expect(plan.isSignOutOnly).toBe(false);
  });

  it("deletes the authenticated account and signs out only after successful deletion", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await deleteAuthenticatedAccount({
      authenticatedUserId: "auth-user-123",
      deleteUser,
      signOut,
    });

    expect(deleteUser).toHaveBeenCalledWith("auth-user-123");
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("does not sign out when account deletion fails", async () => {
    const deleteUser = vi
      .fn()
      .mockResolvedValue({ error: new Error("Deletion failed") });
    const signOut = vi.fn();

    await expect(
      deleteAuthenticatedAccount({
        authenticatedUserId: "auth-user-123",
        deleteUser,
        signOut,
      }),
    ).rejects.toThrow("Deletion failed");

    expect(signOut).not.toHaveBeenCalled();
  });
});
