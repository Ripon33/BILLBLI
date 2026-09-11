import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateCurrentProfile } = vi.hoisted(() => ({
  updateCurrentProfile: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/profile-update", () => ({
  updateCurrentProfile,
}));

import { PATCH } from "./route";

describe("profile API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the authenticated user's full name", async () => {
    updateCurrentProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      fullName: "Updated User",
    });

    const response = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Updated User",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      profile: {
        id: "user-1",
        email: "user@example.com",
        fullName: "Updated User",
      },
    });

    expect(updateCurrentProfile).toHaveBeenCalledWith({
      fullName: "Updated User",
    });
  });

  it("returns 401 when there is no authenticated user", async () => {
    updateCurrentProfile.mockRejectedValue(
      new Error("Authenticated user is required"),
    );

    const response = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Updated User",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Authentication required.",
    });
  });

  it("returns 400 for an invalid profile update", async () => {
    updateCurrentProfile.mockRejectedValue(
      new Error("Full name is required"),
    );

    const response = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Full name is required",
    });
  });
});
