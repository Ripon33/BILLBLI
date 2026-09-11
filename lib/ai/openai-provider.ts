import OpenAI from "openai";
import type { AIRequest, AIResult } from "./capability";
import { getAIModelPolicy } from "./model-policy";
import type { AIProvider } from "./provider";

interface OpenAIResponsesClient {
  responses: {
    create: (input: Record<string, unknown>) => Promise<{
      output_text?: string;
    }>;
  };
}

interface OpenAIProviderOptions {
  client?: OpenAIResponsesClient;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  private readonly client: OpenAIResponsesClient;

  constructor(options: OpenAIProviderOptions = {}) {
    this.client = options.client ?? new OpenAI();
  }

  async generate(request: AIRequest): Promise<AIResult> {
    const policy = getAIModelPolicy(request.mode);

    const reasoningEffort =
      request.mode === "best_quality"
        ? "high"
        : request.mode === "balanced"
          ? "medium"
          : "low";

    const response = await this.client.responses.create({
      model: policy.model,
      input: request.input,
      reasoning: {
        effort: reasoningEffort,
      },
      store: false,
    });

    return {
      text: response.output_text?.trim() ?? "",
    };
  }
}
