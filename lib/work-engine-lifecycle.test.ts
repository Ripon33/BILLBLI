import { describe, expect, it } from "vitest";
import {
  createWork,
  createWorkTask,
  transitionWork,
  transitionWorkTask,
} from "./work-engine";

describe("work engine lifecycle", () => {
  it("allows valid work transitions", () => {
    const work = createWork({
      title: "Prepare report",
      goal: "Create a decision-ready report",
    });

    const ready = transitionWork(work, "ready");
    const running = transitionWork(ready, "running");
    const completed = transitionWork(running, "completed");

    expect(completed.status).toBe("completed");
  });

  it("rejects invalid work transitions", () => {
    const work = createWork({
      title: "Prepare report",
      goal: "Create a decision-ready report",
    });

    expect(() => transitionWork(work, "completed")).toThrow(
      "Invalid work transition",
    );
  });

  it("allows valid task transitions", () => {
    const task = createWorkTask({
      title: "Collect market data",
    });

    const running = transitionWorkTask(task, "running");
    const completed = transitionWorkTask(running, "completed");

    expect(completed.status).toBe("completed");
  });

  it("rejects invalid task transitions", () => {
    const task = createWorkTask({
      title: "Collect market data",
    });

    expect(() => transitionWorkTask(task, "completed")).toThrow(
      "Invalid task transition",
    );
  });

  it("does not allow a completed task to transition again", () => {
    const task = createWorkTask({
      title: "Collect market data",
      status: "completed",
    });

    expect(() => transitionWorkTask(task, "running")).toThrow(
      "Invalid task transition",
    );
  });
});
