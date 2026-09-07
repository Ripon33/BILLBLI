import { describe, expect, it } from "vitest";
import {
  createWork,
  transitionWork,
  type WorkPriority,
  type WorkStatus,
} from "./work-engine";

describe("work engine domain", () => {
  it("creates a work item with the required v1 fields", () => {
    const work = createWork({
      title: "Prepare a market research report",
      goal: "Understand the current market and produce a decision-ready report",
    });

    expect(work.id).toEqual(expect.any(String));
    expect(work.title).toBe("Prepare a market research report");
    expect(work.goal).toBe(
      "Understand the current market and produce a decision-ready report",
    );
    expect(work.status).toBe("draft");
    expect(work.priority).toBe("normal");
    expect(work.createdAt).toEqual(expect.any(String));
    expect(work.updatedAt).toEqual(expect.any(String));
  });

  it("supports the approved work statuses", () => {
    const statuses: WorkStatus[] = [
      "draft",
      "ready",
      "running",
      "waiting_input",
      "waiting_approval",
      "completed",
      "failed",
      "cancelled",
    ];

    expect(statuses).toHaveLength(8);
  });

  it("supports the approved work priorities", () => {
    const priorities: WorkPriority[] = ["low", "normal", "high", "urgent"];

    expect(priorities).toHaveLength(4);
  });
});

describe("work engine lifecycle", () => {
  it("moves draft work to ready", () => {
    const work = createWork({
      title: "Prepare a market research report",
      goal: "Understand the current market",
    });

    const updated = transitionWork(work, "ready");

    expect(updated.status).toBe("ready");
    expect(updated.id).toBe(work.id);
    expect(updated.updatedAt).not.toBe(work.updatedAt);
  });

  it("rejects an invalid lifecycle transition", () => {
    const work = createWork({
      title: "Prepare a market research report",
      goal: "Understand the current market",
    });

    expect(() => transitionWork(work, "completed")).toThrow(
      "Invalid work transition",
    );
  });
});
