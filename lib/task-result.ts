export type TaskResultMessageInput = {
  status: "needs_input" | "waiting_approval";
  domain: string;
  goal: string;
};

export type TaskResultMessage = {
  title: string;
  description: string;
};

export function getTaskResultMessage(
  task: TaskResultMessageInput,
): TaskResultMessage {
  if (task.status === "needs_input") {
    return {
      title: "A few details are needed.",
      description: "BILLBLI needs more information before it can continue.",
    };
  }

  return {
    title: "Your approval is required.",
    description: "BILLBLI is ready to proceed, but needs your approval first.",
  };
}
