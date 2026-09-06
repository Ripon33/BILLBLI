import { describe, expect, it } from "vitest";
import { routeTask } from "./task-routing";

describe("task routing", () => {
  it("creates a task for execution commands", () => {
    const result = routeTask("Book a flight to Dubai.");

    expect(result).toMatchObject({
      route: "task",
      task: {
        intent: "execute",
        domain: "travel",
        goal: "book_flight",
        requiredTools: ["travel_booking"],
        approvalRequired: true,
        status: "needs_input",
      },
    });
  });
});
