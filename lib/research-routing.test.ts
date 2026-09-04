import { describe, expect, it } from "vitest";
import { classifyIntent } from "./intent-engine";
import { shouldUseWebResearch } from "./research-routing";

describe("research routing", () => {
  it("does not use web research for study learning", () => {
    expect(shouldUseWebResearch("Explain quantum mechanics like I'm 15, then give me 5 questions to test my understanding.")).toBe(false);
  });

  it("uses web research for evidence-based decisions", () => {
    expect(shouldUseWebResearch("Research whether I should open a coffee shop in Cox's Bazar with ৳10 lakh.")).toBe(true);
  });

  it("uses web research for evidence-based shopping decisions", () => {
    expect(shouldUseWebResearch("Which laptop should I buy for university? Compare the latest models, prices, and battery life.")).toBe(true);
  });

  it("uses web research for classified shopping decisions", () => {
    const classification = classifyIntent("Which laptop should I buy for university? Compare the latest models, prices, and battery life.");
    expect(shouldUseWebResearch("Which laptop should I buy for university?", classification)).toBe(true);
  });
});
