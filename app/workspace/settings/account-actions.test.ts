import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const actionPath = resolve(
  process.cwd(),
  "app/workspace/settings/account-actions.ts",
);

describe("account actions", () => {
  it("uses the server-side current-account deletion operation", () => {
    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain("deleteCurrentAccount");
    expect(source).toContain('"use server"');
  });

  it("does not expose the Supabase admin client to the client component", () => {
    const source = readFileSync(actionPath, "utf8");

    expect(source).not.toContain("createAdminClient");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
