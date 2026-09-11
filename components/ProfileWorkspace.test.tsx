import { describe, expect, it } from "vitest";
import { createProfileViewModel } from "./ProfileWorkspace";

describe("ProfileWorkspace", () => {
  it("builds an authenticated profile view from user data", () => {
    expect(
      createProfileViewModel({
        id: "user-1",
        email: "user@example.com",
        user_metadata: {
          full_name: "Test User",
        },
      }),
    ).toEqual({
      userId: "user-1",
      email: "user@example.com",
      fullName: "Test User",
    });
  });

  it("falls back safely when full name is unavailable", () => {
    expect(
      createProfileViewModel({
        id: "user-2",
        email: "user@example.com",
        user_metadata: {},
      }),
    ).toEqual({
      userId: "user-2",
      email: "user@example.com",
      fullName: "BILLBLI User",
    });
  });
});

describe("profile editing", () => {
  it("normalizes a profile name before saving", async () => {
    const { normalizeProfileName } = await import("./ProfileWorkspace");

    expect(normalizeProfileName("  Updated User  ")).toBe("Updated User");
  });

  it("rejects an empty profile name", async () => {
    const { normalizeProfileName } = await import("./ProfileWorkspace");

    expect(() => normalizeProfileName("   ")).toThrow(
      "Full name is required",
    );
  });

  it("builds the profile update request", async () => {
    const { buildProfileUpdateRequest } = await import("./ProfileWorkspace");

    expect(buildProfileUpdateRequest("  Updated User ")).toEqual({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Updated User",
      }),
    });
  });

  it("extracts the updated profile from the API response", async () => {
    const { readProfileUpdateResponse } = await import(
      "./ProfileWorkspace"
    );

    expect(
      readProfileUpdateResponse({
        profile: {
          id: "user-1",
          email: "user@example.com",
          fullName: "Updated User",
        },
      }),
    ).toEqual({
      id: "user-1",
      email: "user@example.com",
      fullName: "Updated User",
    });
  });
});
