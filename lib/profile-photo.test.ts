import { describe, expect, it } from "vitest";
import {
  validateProfilePhoto,
  PROFILE_PHOTO_MAX_SIZE,
} from "./profile-photo";

describe("profile photo validation", () => {
  it("accepts JPEG, PNG, and WebP", () => {
    expect(
      validateProfilePhoto({
        name: "avatar.jpg",
        type: "image/jpeg",
        size: 1024,
      }),
    ).toEqual({
      name: "avatar.jpg",
      type: "image/jpeg",
      size: 1024,
    });

    expect(
      validateProfilePhoto({
        name: "avatar.png",
        type: "image/png",
        size: 1024,
      }),
    ).toEqual({
      name: "avatar.png",
      type: "image/png",
      size: 1024,
    });
  });

  it("rejects unsupported image types", () => {
    expect(() =>
      validateProfilePhoto({
        name: "avatar.gif",
        type: "image/gif",
        size: 1024,
      }),
    ).toThrow("Profile photo type is not supported.");
  });

  it("rejects oversized photos", () => {
    expect(() =>
      validateProfilePhoto({
        name: "avatar.jpg",
        type: "image/jpeg",
        size: PROFILE_PHOTO_MAX_SIZE + 1,
      }),
    ).toThrow("Profile photo is too large.");
  });
});
