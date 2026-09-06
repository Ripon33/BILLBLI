import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { deleteAuthenticatedAccountWithAdmin } from "./auth/account-deletion";

describe("server-side account deletion", () => {
  it("deletes the authenticated user through the admin operation", async () => {
    const adminDeleteUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await deleteAuthenticatedAccountWithAdmin({
      authenticatedUserId: "auth-user-123",
      adminDeleteUser,
      signOut,
    });

    expect(adminDeleteUser).toHaveBeenCalledWith("auth-user-123");
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("does not sign out when the admin deletion fails", async () => {
    const adminDeleteUser = vi
      .fn()
      .mockResolvedValue({ error: new Error("Deletion failed") });
    const signOut = vi.fn();

    await expect(
      deleteAuthenticatedAccountWithAdmin({
        authenticatedUserId: "auth-user-123",
        adminDeleteUser,
        signOut,
      }),
    ).rejects.toThrow("Deletion failed");

    expect(signOut).not.toHaveBeenCalled();
  });
});
