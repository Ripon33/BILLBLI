import { describe, expect, it } from "vitest";
import { classifyIntent } from "./intent-engine";
import { getAnswerRoute } from "./answer-routing";

describe("intent routing", () => {
  it("routes study learning requests away from research", () => {
    const result = classifyIntent(
      "Explain quantum mechanics like I'm 15, then give me 5 questions to test whether I understood it."
    );

    expect(result.primaryIntent).toBe("learn");
    expect(result.primaryMode).toBe("study");
  });

  it("keeps research decisions on the evidence-first path", () => {
    const result = classifyIntent(
      "Research whether I should open a coffee shop in Cox's Bazar with ৳10 lakh."
    );

    expect(result.primaryIntent).toBe("research");
    expect(result.primaryMode).toBe("research");
  });

  it("routes execution commands to the task flow", () => {
  const result = classifyIntent("Book a flight to Dubai.");

  expect(result.primaryIntent).toBe("execute");
  expect(result.primaryMode).toBe("travel");
  expect(getAnswerRoute("Book a flight to Dubai.", result)).toBe("task");
});

});
