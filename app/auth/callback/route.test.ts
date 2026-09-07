import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("auth callback route", () => {
  it("exports a GET callback handler", () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe("function");
  });
});
