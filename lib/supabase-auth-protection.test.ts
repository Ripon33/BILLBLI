import { describe, expect, it } from "vitest";

describe("Supabase auth protection", () => {
  it("exports a session refresh helper", async () => {
    const { updateSession } = await import("./supabase/middleware");
    expect(updateSession).toBeTypeOf("function");
  });

  it("exports a protected-route helper", async () => {
    const { requireUser } = await import("./supabase/auth");
    expect(requireUser).toBeTypeOf("function");
  });
});
