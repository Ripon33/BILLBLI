import { describe, expect, it } from "vitest";
import {
  createWorkTask,
  validateTaskDependencies,
} from "./work-engine";

describe("Work Engine task dependencies", () => {
  it("accepts dependencies that reference existing tasks", () => {
    const first = createWorkTask({ title: "Research competitors" });
    const second = createWorkTask({
      title: "Compare findings",
      dependsOn: [first.id],
    });

    expect(() =>
      validateTaskDependencies(second, [first, second]),
    ).not.toThrow();
  });

  it("rejects a dependency that references a missing task", () => {
    const task = createWorkTask({
      title: "Prepare recommendation",
      dependsOn: ["missing-task-id"],
    });

    expect(() =>
      validateTaskDependencies(task, [task]),
    ).toThrow("Unknown task dependency");
  });

  it("rejects a task depending on itself", () => {
    const task = createWorkTask({ title: "Self dependency" });
    task.dependsOn = [task.id];

    expect(() =>
      validateTaskDependencies(task, [task]),
    ).toThrow("Task cannot depend on itself");
  });
});
