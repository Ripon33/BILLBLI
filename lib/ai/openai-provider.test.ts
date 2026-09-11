import { describe, expect, it, vi } from "vitest";
import type { AIRequest } from "./capability";
import type { AIProvider } from "./provider";
import { OpenAIProvider } from "./openai-provider";

describe("OpenAI provider", () => {
  it("implements the provider contract", () => {
    const provider: AIProvider = new OpenAIProvider({
      client: {
        responses: {
          create: vi.fn(),
        },
      },
    });

    expect(provider.name).toBe("openai");
  });

  it("generates a normalized result through the Responses API", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: "A BILLBLI response.",
    });

    const provider = new OpenAIProvider({
      client: {
        responses: {
          create,
        },
      },
    });

    const request: AIRequest = {
      capability: "text",
      mode: "balanced",
      input: "Explain this business decision.",
    };

    const result = await provider.generate(request);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6-luna",
        input: request.input,
        store: false,
      }),
    );

    expect(result).toEqual({
      text: "A BILLBLI response.",
    });
  });

  it("maps reasoning capability to the Responses API", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: "Reasoned result.",
    });

    const provider = new OpenAIProvider({
      client: {
        responses: {
          create,
        },
      },
    });

    await provider.generate({
      capability: "reasoning",
      mode: "best_quality",
      input: "Analyze this decision.",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        input: "Analyze this decision.",
        reasoning: {
          effort: "high",
        },
      }),
    );
  });
});
