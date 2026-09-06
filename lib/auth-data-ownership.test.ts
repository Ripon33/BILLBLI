import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildOwnedRecord } from "./auth/data-ownership";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/202609070001_auth_user_data.sql",
);

describe("authenticated data ownership", () => {
  it("uses the authenticated user id instead of a client-supplied user id", () => {
    const record = buildOwnedRecord({
      authenticatedUserId: "auth-user-123",
      clientUserId: "attacker-user-456",
      data: {
        question: "Should I launch this?",
      },
    });

    expect(record.user_id).toBe("auth-user-123");
    expect(record.user_id).not.toBe("attacker-user-456");
  });

  it("rejects missing authenticated identity", () => {
    expect(() =>
      buildOwnedRecord({
        authenticatedUserId: " ",
        data: {
          question: "Should I launch this?",
        },
      }),
    ).toThrow(/Authenticated user is required/);
  });

  it("adds direct user ownership to decision-owned records", () => {
    const migration = readFileSync(migrationPath, "utf8");

    for (const table of [
      "research_runs",
      "sources",
      "evidence",
      "decision_factors",
      "recommendations",
      "decision_events",
    ]) {
      expect(migration).toContain(
        `alter table ${table}\n  add column if not exists user_id`,
      );
    }
  });

  it("enforces ownership with auth.uid() RLS policies", () => {
    const migration = readFileSync(migrationPath, "utf8");

    for (const table of [
      "research_runs",
      "sources",
      "evidence",
      "decision_factors",
      "recommendations",
      "decision_events",
    ]) {
      expect(migration).toContain(`on ${table}`);
      expect(migration).toContain(
        `using (auth.uid() = user_id)`,
      );
      expect(migration).toContain(
        `with check (auth.uid() = user_id)`,
      );
    }
  });
});
