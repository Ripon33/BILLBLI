import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Supabase admin client", () => {
  it("uses the service-role key and server-only module boundary", () => {
    const adminClientPath = resolve(
      process.cwd(),
      "lib/supabase/admin.ts",
    );

    const source = readFileSync(adminClientPath, "utf8");

    expect(source).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(source).toContain("createClient");
    expect(source).toContain("server-only");
  });
});
