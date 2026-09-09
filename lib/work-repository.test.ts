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
          eq(column: string, value: string) {
            const filteredRows = [...rows.values()].filter(
              (row) => row[column] === value,
            );

            return {
              eq(nextColumn: string, nextValue: string) {
                const matchingRows = filteredRows.filter(
                  (row) => row[nextColumn] === nextValue,
                );

                return {
                  single: async () => ({
                    data: matchingRows[0] ?? null,
                    error: matchingRows[0]
                      ? null
                      : { message: "Work not found" },
                  }),
                };
              },

              single: async () => ({
                data: filteredRows[0] ?? null,
                error: filteredRows[0]
                  ? null
                  : { message: "Work not found" },
              }),

              then(
                resolve: (value: {
                  data: Record<string, unknown>[];
                  error: null;
                }) => unknown,
              ) {
                return resolve({
                  data: filteredRows,
                  error: null,
                });
              },
            };
          },
        };
      },
    };
  };

  return { from };
}

describe("Work Engine repository", () => {
  it("exposes the authenticated user id through the repository", async () => {
    const repository = createWorkRepository({
      supabase: createFakeSupabase(),
      getAuthenticatedUserId: async () => "authenticated-user-789",
    });

    await expect(repository.getAuthenticatedUserId()).resolves.toBe(
      "authenticated-user-789",
    );
  });

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

  it("persists and loads persistent worker identity and context", async () => {
    const work = createWork({
      title: "Marketing worker",
      goal: "Grow the company's digital presence",
    });

    const worker = {
      ...work,
      workerType: "digital_marketer" as const,
      workerName: "Maya",
      workerContext: {
        business: "BILLBLI",
        audience: "small businesses",
      },
    };

    const supabase = createFakeSupabase();

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => "user-123",
    });

    const created = await repository.createWork(worker);
    const loaded = await repository.getWork(worker.id);

    expect(created.workerType).toBe("digital_marketer");
    expect(created.workerName).toBe("Maya");
    expect(created.workerContext).toEqual({
      business: "BILLBLI",
      audience: "small businesses",
    });

    expect(loaded?.workerType).toBe("digital_marketer");
    expect(loaded?.workerName).toBe("Maya");
    expect(loaded?.workerContext).toEqual({
      business: "BILLBLI",
      audience: "small businesses",
    });
  });

  it("lists only Work records owned by the authenticated user", async () => {
    const firstWork = createWork({
      title: "Owned worker",
      goal: "Support the authenticated user",
    });

    const secondWork = createWork({
      title: "Another owned worker",
      goal: "Continue persistent work",
    });

    const supabase = createFakeSupabase();

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => "user-123",
    });

    await repository.createWork(firstWork);
    await repository.createWork(secondWork);

    const works = await repository.listWorks();

    expect(works).toHaveLength(2);
    expect(works.map((work) => work.id)).toEqual(
      expect.arrayContaining([firstWork.id, secondWork.id]),
    );
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
