import { describe, expect, it } from "vitest";

describe("account settings password helpers", () => {
  it("validates matching passwords", async () => {
    const { validatePasswordChange } = await import("./AccountSettings");

    expect(
      validatePasswordChange("NewSecurePassword123!", "NewSecurePassword123!"),
    ).toEqual({
      valid: true,
      error: null,
    });
  });

  it("rejects mismatched passwords", async () => {
    const { validatePasswordChange } = await import("./AccountSettings");

    expect(
      validatePasswordChange("NewSecurePassword123!", "DifferentPassword123!"),
    ).toEqual({
      valid: false,
      error: "Passwords do not match",
    });
  });

  it("rejects passwords shorter than eight characters", async () => {
    const { validatePasswordChange } = await import("./AccountSettings");

    expect(validatePasswordChange("short", "short")).toEqual({
      valid: false,
      error: "Password must be at least 8 characters",
    });
  });

  it("builds a password update request", async () => {
    const { buildPasswordUpdateRequest } = await import("./AccountSettings");

    expect(buildPasswordUpdateRequest("NewSecurePassword123!")).toEqual({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: "NewSecurePassword123!",
      }),
    });
  });
});
