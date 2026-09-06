import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("current account deletion", () => {
  it("uses the server admin client for permanent account deletion", () => {
    const source = readFileSync(
      resolve(process.cwd(), "lib/auth/account-deletion.ts"),
      "utf8",
    );

    expect(source).toContain('@/lib/supabase/admin');
    expect(source).toContain("createAdminClient");
    expect(source).toContain("deleteUser");
    expect(source).not.toContain("supabase.auth.admin.deleteUser");
  });
});
