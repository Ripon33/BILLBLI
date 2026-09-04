import { describe, expect, it } from "vitest";
import { createStudyResponse } from "./study-response";

describe("study response", () => {
  it("creates a structured learning response", () => {
    const result = createStudyResponse({
      explanation: "Quantum mechanics describes how very small things behave.",
      examples: ["Electrons can behave like waves."],
      practiceQuestions: [
        "What is wave-particle duality?",
        "Why can't we predict an electron's exact position?",
      ],
    });

    expect(result).toMatchObject({
      type: "study",
      explanation: "Quantum mechanics describes how very small things behave.",
      examples: ["Electrons can behave like waves."],
      practiceQuestions: [
        "What is wave-particle duality?",
        "Why can't we predict an electron's exact position?",
      ],
    });
  });
});
