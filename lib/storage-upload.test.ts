import { describe, expect, it } from "vitest";
import {
  getStorageBucket,
  getStorageUploadOptions,
} from "./storage-upload";

describe("storage upload configuration", () => {
  it("uses the private user-files bucket", () => {
    expect(getStorageBucket()).toBe("user-files");
  });

  it("disallows upsert so uploads cannot overwrite another object", () => {
    expect(getStorageUploadOptions()).toEqual({
      upsert: false,
      cacheControl: "3600",
    });
  });
});
