import { describe, expect, it } from "vitest";
import { createTask, type TaskStatus } from "./task-engine";

describe("BILLBLI task engine", () => {
  it("creates a structured research task from a user command", () => {
    const task = createTask(
      "Research the evidence about climate change."
    );

    expect(task).toMatchObject({
      input: "Research the evidence about climate change.",
      intent: "research",
      domain: "research",
      goal: "research",
      requiredTools: ["web_research"],
      approvalRequired: false,
      status: "ready",
    });
  });
});

  it("creates a shopping decision task", () => {
    const task = createTask(
      "Which laptop should I buy for video editing?"
    );

    expect(task).toMatchObject({
      intent: "decide",
      domain: "shopping",
      goal: "compare_products",
      requiredTools: ["web_research"],
      approvalRequired: false,
      status: "ready",
    });
  });

  it("creates a study planning task", () => {
    const task = createTask(
      "Create a 30-day study plan for my biology exam."
    );

    expect(task).toMatchObject({
      intent: "plan",
      domain: "study",
      goal: "create_study_plan",
      requiredTools: [],
      approvalRequired: false,
      status: "ready",
    });
  });

  it("creates an execution task that requires approval", () => {
    const task = createTask(
      "Send this report to my team."
    );

    expect(task).toMatchObject({
      intent: "execute",
      domain: "operations",
      goal: "send_report",
      requiredTools: ["messaging"],
      approvalRequired: true,
      status: "waiting_approval",
    });
  });

it("supports the complete task status lifecycle", () => {
  const statuses: TaskStatus[] = [
    "ready",
    "needs_input",
    "waiting_approval",
    "running",
    "completed",
    "failed",
  ];

  expect(statuses).toHaveLength(6);
});

it("starts approval-gated execution tasks in waiting_approval", () => {
  const task = createTask(
    "Send this report to my team."
  );

  expect(task.status).toBe("waiting_approval");
});

it("keeps non-execution tasks ready without approval", () => {
  const task = createTask(
    "Research the evidence about climate change."
  );

  expect(task).toMatchObject({
    approvalRequired: false,
    status: "ready",
  });
});

it("marks incomplete execution requests as needing input", () => {
  const task = createTask(
    "Book a flight to Dubai."
  );

  expect(task).toMatchObject({
    intent: "execute",
    domain: "travel",
    goal: "book_flight",
    requiredTools: ["travel_booking"],
    approvalRequired: true,
    status: "needs_input",
  });
});
