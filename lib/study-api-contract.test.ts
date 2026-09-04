import { describe, expect, it } from "vitest";
import { createStudyResponse } from "./study-response";

describe("study API contract", () => {
  it("returns the fields required by the Study UI", () => {
    const result = createStudyResponse({
      explanation: "A simple explanation.",
      examples: ["Example one", "Example two"],
      practiceQuestions: ["Question one", "Question two"],
    });

    expect(result.type).toBe("study");
    expect(result.explanation).toBeTruthy();
    expect(result.examples).toHaveLength(2);
    expect(result.practiceQuestions).toHaveLength(2);
  });
});
