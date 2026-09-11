import { describe, expect, it } from "vitest";
import {
  validateAttachment,
  MAX_ATTACHMENT_SIZE,
  ALLOWED_ATTACHMENT_TYPES,
} from "./attachment-validation";

describe("attachment validation", () => {
  it("accepts supported image and document files", () => {
    expect(
      validateAttachment({
        name: "photo.png",
        type: "image/png",
        size: 1024,
      }),
    ).toEqual({
      name: "photo.png",
      type: "image/png",
      size: 1024,
    });

    expect(
      validateAttachment({
        name: "report.pdf",
        type: "application/pdf",
        size: 2048,
      }),
    ).toEqual({
      name: "report.pdf",
      type: "application/pdf",
      size: 2048,
    });
  });

  it("rejects unsupported file types", () => {
    expect(() =>
      validateAttachment({
        name: "script.exe",
        type: "application/x-msdownload",
        size: 1024,
      }),
    ).toThrow("File type is not supported.");
  });

  it("rejects files above the size limit", () => {
    expect(() =>
      validateAttachment({
        name: "large.pdf",
        type: "application/pdf",
        size: MAX_ATTACHMENT_SIZE + 1,
      }),
    ).toThrow("File is too large.");
  });

  it("exports an explicit allowlist", () => {
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("application/pdf");
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("image/png");
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("image/jpeg");
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("image/webp");
  });
});
