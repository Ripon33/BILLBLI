import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Work Engine ownership policies", () => {
  it("defines RLS ownership policies for Work Engine records", () => {
    const migrationsDir = resolve(process.cwd(), "supabase/migrations");

    const migration = [
      "202609070001_work_engine_core.sql",
      "202609070002_work_engine_core.sql",
      "202609070003_work_engine_core.sql",
    ].find((name) => existsSync(resolve(migrationsDir, name)));

    expect(migration).toBeDefined();

    const source = readFileSync(
      resolve(migrationsDir, migration!),
      "utf8",
    );

    expect(source).toContain("enable row level security");
    expect(source).toContain("works");
    expect(source).toContain("work_plans");
    expect(source).toContain("work_tasks");
    expect(source).toContain("work_executions");
    expect(source).toContain("work_task_results");
    expect(source).toContain("auth.uid()");
  });
});
