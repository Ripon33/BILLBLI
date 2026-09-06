import { createTask, type BillbliTask } from "./task-engine";

export type TaskRouteResult = {
  route: "task";
  task: BillbliTask;
};

export function routeTask(input: string): TaskRouteResult {
  return {
    route: "task",
    task: createTask(input),
  };
}
