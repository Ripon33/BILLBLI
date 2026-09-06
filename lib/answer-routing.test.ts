import { describe, expect, it } from "vitest";
import { getAnswerRoute } from "./answer-routing";

describe("answer routing", () => {
  it("routes study learning to the study answer path", () => {
    expect(
      getAnswerRoute(
        "Explain quantum mechanics like I'm 15, then give me 5 questions to test my understanding."
      )
    ).toBe("study");
  });

  it("routes research decisions to the research path", () => {
    expect(
      getAnswerRoute(
        "Research whether I should open a coffee shop in Cox's Bazar with ৳10 lakh."
      )
    ).toBe("research");
  });

  it("routes shopping decisions to the research path", () => {
    expect(
      getAnswerRoute(
        "Which laptop should I buy? Compare the latest models, prices, and battery life."
      )
    ).toBe("research");
  });

  it("routes execution commands to the task path", () => {
    expect(
      getAnswerRoute("Book a flight to Dubai.")
    ).toBe("task");
  });
});
