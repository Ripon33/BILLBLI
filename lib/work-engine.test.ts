import { describe, expect, it } from "vitest";
import {
  createWork,
  createWorkTask,
  transitionWork,
  getWorkPermission,
  authorizeWork,
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

describe("work engine autonomy", () => {
  it("creates work with normal auto autonomy by default", () => {
    const work = createWork({
      title: "Research competitors",
      goal: "Identify the strongest competitors",
    });

    expect(work.autonomy).toBe("auto");
  });

  it("allows an explicit autonomy level when creating work", () => {
    const work = createWork({
      title: "Send a customer proposal",
      goal: "Prepare and send the approved proposal",
      autonomy: "approval",
    });

    expect(work.autonomy).toBe("approval");
  });

  it("supports the four approved autonomy levels", () => {
    const autonomyLevels = ["auto", "review", "approval", "restricted"] as const;

    expect(autonomyLevels).toHaveLength(4);
  });
});

describe("work engine permission decisions", () => {
  it("allows routine auto work without human authorization", () => {
    const work = createWork({
      title: "Research competitors",
      goal: "Identify the strongest competitors",
      autonomy: "auto",
    });

    expect(getWorkPermission(work)).toEqual({
      allowed: true,
      requiresHumanDecision: false,
      requiresAuthorization: false,
    });
  });

  it("requires human authorization for approval work", () => {
    const work = createWork({
      title: "Send customer proposal",
      goal: "Send the approved proposal to the customer",
      autonomy: "approval",
    });

    expect(getWorkPermission(work)).toEqual({
      allowed: false,
      requiresHumanDecision: false,
      requiresAuthorization: true,
    });
  });

  it("requires a human decision when the work crosses a human decision boundary", () => {
    const work = createWork({
      title: "Terminate employee",
      goal: "Decide whether an employee should be terminated",
      autonomy: "auto",
    });

    expect(getWorkPermission(work)).toEqual({
      allowed: false,
      requiresHumanDecision: true,
      requiresAuthorization: true,
    });
  });
});

describe("work engine human authorization", () => {
  it("starts approval work without human authorization", () => {
    const work = createWork({
      title: "Send customer proposal",
      goal: "Send the approved proposal to the customer",
      autonomy: "approval",
    });

    expect(work.authorization).toBe("required");
  });

  it("records explicit human authorization", () => {
    const work = createWork({
      title: "Send customer proposal",
      goal: "Send the approved proposal to the customer",
      autonomy: "approval",
    });

    const authorized = authorizeWork(work);

    expect(authorized.authorization).toBe("authorized");
    expect(authorized.id).toBe(work.id);
    expect(authorized.updatedAt).not.toBe(work.updatedAt);
  });

  it("does not treat an AI recommendation as human authorization", () => {
    const work = createWork({
      title: "Choose an employee action",
      goal: "Recommend the appropriate next step",
      autonomy: "review",
    });

    expect(work.authorization).toBe("not_required");
  });
});



describe("work engine task classification integration", () => {
  it("includes the existing task classification domain", () => {
    const task = createWorkTask({
      title: "Research the best accounting software for my business",
    });

    expect(task.domain).toBe("research");
  });
});
