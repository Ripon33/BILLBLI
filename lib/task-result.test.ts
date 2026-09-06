import { describe, expect, it } from "vitest";
import { getTaskResultMessage } from "./task-result";

describe("task result messaging", () => {
  it("explains when a task needs input", () => {
    expect(
      getTaskResultMessage({
        status: "needs_input",
        domain: "travel",
        goal: "book_flight",
      }),
    ).toEqual({
      title: "A few details are needed.",
      description: "BILLBLI needs more information before it can continue.",
    });
  });

  it("explains when a task is waiting for approval", () => {
    expect(
      getTaskResultMessage({
        status: "waiting_approval",
        domain: "operations",
        goal: "send_report",
      }),
    ).toEqual({
      title: "Your approval is required.",
      description: "BILLBLI is ready to proceed, but needs your approval first.",
    });
  });
});
