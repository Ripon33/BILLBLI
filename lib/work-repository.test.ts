import { describe, expect, it } from "vitest";
import { createWork } from "./work-engine";
import { createWorkRepository } from "./work-repository";

function createFakeSupabase() {
  const rows = new Map<string, Record<string, unknown>>();

  const from = (table: string) => {
    if (table !== "works") {
      throw new Error(`Unexpected table: ${table}`);
    }

    return {
      insert(row: Record<string, unknown>) {
        rows.set(String(row.id), row);

        return {
          select() {
            return {
              single: async () => ({
                data: row,
                error: null,
              }),
            };
          },
        };
      },

      select() {
        return {
          eq(_column: string, value: string) {
            const builder = {
              eq(_nextColumn: string, nextValue: string) {
                return {
                  single: async () => {
                    const row = rows.get(value);
                    const matchesUser =
                      row && row.user_id === nextValue;

                    return {
                      data: matchesUser ? row : null,
                      error: matchesUser
                        ? null
                        : { message: "Work not found" },
                    };
                  },
                };
              },
              single: async () => {
                const row = rows.get(value);

                return {
                  data: row ?? null,
                  error: row
                    ? null
                    : { message: "Work not found" },
                };
              },
            };

            return builder;
          },
        };
      },
    };
  };

  return { from };
}

describe("Work Engine repository", () => {
  it("creates a Work without accepting a client user_id", async () => {
    const work = createWork({
      title: "Research competitors",
      goal: "Understand the competitive landscape",
    });

    const supabase = createFakeSupabase();

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => "user-123",
    });

    const created = await repository.createWork(work);

    expect(created.id).toBe(work.id);
    expect(created.title).toBe(work.title);
    expect(created.goal).toBe(work.goal);
  });

  it("uses the authenticated user id when creating a Work", async () => {
    const work = createWork({
      title: "Ownership test",
      goal: "Verify server-side ownership",
    });

    const supabase = createFakeSupabase();

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => "authenticated-user-456",
    });

    await repository.createWork(work);

    const loaded = await repository.getWork(work.id);

    expect(loaded?.id).toBe(work.id);
  });

  it("loads a Work by id", async () => {
    const work = createWork({
      title: "Research competitors",
      goal: "Understand the competitive landscape",
    });

    const supabase = createFakeSupabase();

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => "user-123",
    });

    await repository.createWork(work);

    const loaded = await repository.getWork(work.id);

    expect(loaded?.id).toBe(work.id);
    expect(loaded?.title).toBe(work.title);
  });
});
