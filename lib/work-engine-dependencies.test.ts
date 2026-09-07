import { describe, expect, it } from "vitest";
import {
  createWorkTask,
  validateTaskDependencies,
} from "./work-engine";

describe("work engine task dependencies", () => {
  it("accepts a task that depends on a completed prerequisite", () => {
    const prerequisite = createWorkTask({
      title: "Collect market data",
      status: "completed",
    });

    const task = createWorkTask({
      title: "Analyze market data",
      dependsOn: [prerequisite.id],
    });

    expect(
      validateTaskDependencies(task, [prerequisite]),
    ).toEqual({
      valid: true,
      executable: true,
    });
  });

  it("rejects a task that depends on itself", () => {
    const task = createWorkTask({
      title: "Analyze market data",
    });

    expect(() =>
      validateTaskDependencies(
        { ...task, dependsOn: [task.id] },
        [task],
      ),
    ).toThrow("Task cannot depend on itself");
  });

  it("rejects circular dependencies", () => {
    const taskA = createWorkTask({
      title: "Task A",
    });

    const taskB = createWorkTask({
      title: "Task B",
      dependsOn: [taskA.id],
    });

    expect(() =>
      validateTaskDependencies(
        { ...taskA, dependsOn: [taskB.id] },
        [taskA, taskB],
      ),
    ).toThrow("Circular task dependency");
  });

  it("does not allow execution while a prerequisite is incomplete", () => {
    const prerequisite = createWorkTask({
      title: "Collect market data",
      status: "running",
    });

    const task = createWorkTask({
      title: "Analyze market data",
      dependsOn: [prerequisite.id],
    });

    expect(
      validateTaskDependencies(task, [prerequisite]),
    ).toEqual({
      valid: true,
      executable: false,
    });
  });
});
