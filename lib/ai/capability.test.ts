import { describe, expect, it } from "vitest";
import {
  AI_CAPABILITIES,
  type AICapability,
  type AIRequest,
  type AIResult,
} from "./capability";

describe("AI capability contracts", () => {
  it("defines the initial BILLBLI capabilities", () => {
    expect(AI_CAPABILITIES).toEqual([
      "text",
      "structured_json",
      "reasoning",
      "research",
    ]);
  });

  it("accepts a provider-neutral AI request", () => {
    const request: AIRequest = {
      capability: "text",
      mode: "balanced",
      input: "Explain this business decision.",
    };

    expect(request.capability).toBe("text");
    expect(request.mode).toBe("balanced");
  });

  it("accepts a normalized AI result", () => {
    const result: AIResult = {
      text: "A normalized BILLBLI result.",
    };

    expect(result.text).toBe("A normalized BILLBLI result.");
  });

  it("restricts capabilities to BILLBLI capability names", () => {
    const capability: AICapability = "reasoning";

    expect(AI_CAPABILITIES).toContain(capability);
  });
});
