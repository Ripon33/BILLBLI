import { describe, expect, it } from "vitest";
import { dynamic } from "./workspace/layout";

describe("authenticated workspace layout", () => {
  it("uses dynamic rendering for request-time authentication", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
