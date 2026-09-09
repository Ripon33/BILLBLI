import { describe, expect, it } from "vitest";
import { createTaskWorkspaceModel } from "./TaskWorkspace";

describe("TaskWorkspace", () => {
  it("creates a governed task model from a user request", () => {
    const model = createTaskWorkspaceModel(
      "Send this report to my team.",
    );

    expect(model).toMatchObject({
      task: {
        input: "Send this report to my team.",
        intent: "execute",
        domain: "operations",
        goal: "send_report",
        requiredTools: ["messaging"],
        approvalRequired: true,
        status: "waiting_approval",
      },
      governance: {
        executionAllowed: false,
        requiresApproval: true,
      },
    });
  });
});
