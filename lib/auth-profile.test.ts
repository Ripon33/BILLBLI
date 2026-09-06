import { describe, expect, it, vi } from "vitest";

describe("authenticated profile", () => {
  it("builds a profile payload with required and optional fields", async () => {
    const { buildProfile } = await import("./auth/profile");

    const result = buildProfile({
      userId: "user-1",
      fullName: "Test User",
      email: "user@example.com",
      photoUrl: "https://example.com/photo.jpg",
      company: "BILLBLI",
      role: "Founder",
      country: "Bangladesh",
    });

    expect(result).toEqual({
      user_id: "user-1",
      full_name: "Test User",
      email: "user@example.com",
      photo_url: "https://example.com/photo.jpg",
      company: "BILLBLI",
      role: "Founder",
      country: "Bangladesh",
    });
  });

  it("allows optional profile fields to be omitted", async () => {
    const { buildProfile } = await import("./auth/profile");

    const result = buildProfile({
      userId: "user-1",
      fullName: "Test User",
      email: "user@example.com",
    });

    expect(result).toEqual({
      user_id: "user-1",
      full_name: "Test User",
      email: "user@example.com",
      photo_url: null,
      company: null,
      role: null,
      country: null,
    });
  });

  it("rejects a missing authenticated user id", async () => {
    const { buildProfile } = await import("./auth/profile");

    expect(() =>
      buildProfile({
        userId: "",
        fullName: "Test User",
        email: "user@example.com",
      }),
    ).toThrow(/user/i);
  });

  it("rejects missing required full name", async () => {
    const { buildProfile } = await import("./auth/profile");

    expect(() =>
      buildProfile({
        userId: "user-1",
        fullName: "",
        email: "user@example.com",
      }),
    ).toThrow(/full name/i);
  });

  it("rejects missing required email", async () => {
    const { buildProfile } = await import("./auth/profile");

    expect(() =>
      buildProfile({
        userId: "user-1",
        fullName: "Test User",
        email: "",
      }),
    ).toThrow(/email/i);
  });

  it("updates a profile using the authenticated user id", async () => {
    const update = vi.fn().mockResolvedValue({
      data: { id: "profile-1" },
      error: null,
    });

    const { saveProfile } = await import("./auth/profile");

    await saveProfile({
      userId: "user-1",
      fullName: "Test User",
      email: "user@example.com",
      update,
    });

    expect(update).toHaveBeenCalledWith({
      user_id: "user-1",
      full_name: "Test User",
      email: "user@example.com",
      photo_url: null,
      company: null,
      role: null,
      country: null,
    });
  });
});
