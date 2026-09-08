import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteCurrentAccount } = vi.hoisted(() => ({
  deleteCurrentAccount: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/account-deletion", () => ({
  deleteCurrentAccount,
}));

import { POST } from "./route";

describe("account deletion API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no authenticated account", async () => {
    deleteCurrentAccount.mockRejectedValue(
      new Error("Authenticated user is required"),
    );

    const response = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Authentication required.",
    });
  });

  it("deletes the account through the server deletion service", async () => {
    deleteCurrentAccount.mockResolvedValue(undefined);

    const response = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
    });
    expect(deleteCurrentAccount).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when account deletion fails unexpectedly", async () => {
    deleteCurrentAccount.mockRejectedValue(
      new Error("Deletion failed"),
    );

    const response = await POST(
      new Request("http://localhost/api/account/delete", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to delete account.",
    });
  });
});
