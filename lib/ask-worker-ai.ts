import type { WorkerType } from "./worker-domain";
import type { AskWorkerRoute } from "./ask-worker";
import { OpenAIProvider } from "./ai/openai-provider";

export async function generateAskWorkerWithAI(input: {
  workerName: string;
  workerType?: WorkerType;
  workerGoal: string;
  message: string;
  route: AskWorkerRoute;
}): Promise<string> {
  const provider = new OpenAIProvider();

  const workerType = input.workerType ?? "custom";

  const prompt = `
You are BILLBLI's AI Workforce assistant.

WORKER:
Name: ${input.workerName}
Type: ${workerType}
Goal: ${input.workerGoal}

REQUEST ROUTE:
${input.route}

USER REQUEST:
${input.message}

Provide a clear, useful response that helps the worker support the user's request.

Important:
- Recommendations are not authorization.
- Do not execute external actions.
- Do not claim that any action was completed.
- Respect the worker's stated goal and role.
- If a human decision or authorization is required, make that clear.
`;

  const result = await provider.generate({
    capability: "text",
    mode: "balanced",
    input: prompt,
  });

  const text = result.text.trim();

  if (!text) {
    throw new Error("No Ask Worker response was generated.");
  }

  return text;
}
