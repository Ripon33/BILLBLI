import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Work Engine persistence schema", () => {
  it("defines the core Work Engine tables", () => {
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

    expect(source).toContain("create table");
    expect(source).toContain("works");
    expect(source).toContain("work_plans");
    expect(source).toContain("work_tasks");
    expect(source).toContain("work_executions");
    expect(source).toContain("work_task_results");

    expect(source).toContain("user_id uuid not null references auth.users(id)");
    expect(source).toContain("title text not null");
    expect(source).toContain("goal text not null");
    expect(source).toContain("status text not null");
    expect(source).toContain("priority text not null");
    expect(source).toContain("work_id uuid not null references works(id)");
    expect(source).toContain("parent_task_id uuid references work_tasks(id)");
    expect(source).toContain("sequence integer not null");
    expect(source).toContain("dependencies jsonb");
    expect(source).toContain("assigned_capability text");
    expect(source).toContain("autonomy_level text not null");
    expect(source).toContain("execution_metadata jsonb");
  });

  it("defines persistent AI Worker fields on works", () => {
    const migrationsDir = resolve(process.cwd(), "supabase/migrations");

    const migration = [
      "202609080001_persistent_ai_workers.sql",
    ].find((name) => existsSync(resolve(migrationsDir, name)));

    expect(migration).toBeDefined();

    const source = readFileSync(
      resolve(migrationsDir, migration!),
      "utf8",
    );

    expect(source).toContain("alter table works");
    expect(source).toContain("add column if not exists worker_type text");
    expect(source).toContain("add column if not exists worker_name text");
    expect(source).toContain("add column if not exists worker_context jsonb");
  });

  it("defines persistent Work autonomy and authorization fields", () => {
    const migrationsDir = resolve(process.cwd(), "supabase/migrations");

    const migrationFiles = [
      "202609100001_work_autonomy_persistence.sql",
    ];

    const migration = migrationFiles.find((name) =>
      existsSync(resolve(migrationsDir, name)),
    );

    expect(migration).toBeDefined();

    const source = readFileSync(
      resolve(migrationsDir, migration!),
      "utf8",
    );

    expect(source).toContain("alter table works");
    expect(source).toContain("add column if not exists autonomy_level text");
    expect(source).toContain('add column if not exists "authorization" text');
  });

});
