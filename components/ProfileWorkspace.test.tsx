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
