import { describe, expect, it } from "vitest";
import { buildDecisionTradeoffs } from "./decision-tradeoff";

describe("decision trade-off engine", () => {
  it("identifies competing benefits and risks from decision evidence", () => {
    const result = buildDecisionTradeoffs(
      {
        question: "Should I open a coffee shop in Cox's Bazar?",
        objective: "open a coffee shop",
        constraints: ["Budget: ৳10 lakh"],
        location: "Cox's Bazar",
        budget: "৳10 lakh",
        timeframe: "6 months",
        preferences: [],
      },
      [
        {
          title: "Tourism demand",
          content:
            "Cox's Bazar receives strong tourist demand, creating opportunities for coffee shops.",
          url: "https://example.com/tourism",
          evidence_score: 82,
          relevance_score: 90,
          directness_score: 85,
          authority: { score: 80, type: "research" },
        },
        {
          title: "Seasonality risk",
          content:
            "Tourism demand varies by season, creating periods of weaker customer demand.",
          url: "https://example.com/seasonality",
          evidence_score: 78,
          relevance_score: 88,
          directness_score: 82,
          authority: { score: 78, type: "research" },
        },
      ],
    );

    expect(result.benefits.length).toBeGreaterThan(0);
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.tradeoffs.length).toBeGreaterThan(0);
    expect(
      result.tradeoffs.some(
        (tradeoff) =>
          tradeoff.toLowerCase().includes("tourist") ||
          tradeoff.toLowerCase().includes("season"),
      ),
    ).toBe(true);
  });

  it("does not invent trade-offs when evidence is insufficient", () => {
    const result = buildDecisionTradeoffs(
      {
        question: "Should I open a coffee shop?",
        objective: "open a coffee shop",
        constraints: [],
        location: null,
        budget: null,
        timeframe: null,
        preferences: [],
      },
      [
        {
          title: "Coffee shop overview",
          content: "Coffee shops serve beverages and food to customers.",
          url: "https://example.com/overview",
          evidence_score: 60,
          relevance_score: 70,
          directness_score: 65,
          authority: { score: 70, type: "general" },
        },
      ],
    );

    expect(result.benefits).toHaveLength(0);
    expect(result.risks).toHaveLength(0);
    expect(result.tradeoffs).toHaveLength(0);
  });

  it("connects evidence conflicts to the decision budget", () => {
    const result = buildDecisionTradeoffs(
      {
        question: "Should I open a premium coffee shop?",
        objective: "open a premium coffee shop",
        constraints: ["Budget: ৳10 lakh"],
        location: "Cox's Bazar",
        budget: "৳10 lakh",
        timeframe: null,
        preferences: [],
      },
      [
        {
          title: "Premium equipment costs more",
          content: "Premium coffee equipment requires higher upfront investment and costs more.",
          url: "https://example.com/equipment",
          evidence_score: 84,
          relevance_score: 90,
          directness_score: 85,
          authority: { score: 80, type: "research" },
        },
        {
          title: "Premium experience advantage",
          content: "Premium equipment can improve beverage quality and customer experience.",
          url: "https://example.com/quality",
          evidence_score: 82,
          relevance_score: 88,
          directness_score: 84,
          authority: { score: 80, type: "research" },
        },
      ],
    );

    expect(result.tradeoffs.length).toBeGreaterThan(0);
    expect(result.decisionFactors).toContain("Budget: ৳10 lakh");
    expect(
      result.tradeoffs.some((tradeoff) =>
        /budget|cost|investment/i.test(tradeoff),
      ),
    ).toBe(true);
  });

  it("includes relevant decision constraints as factors", () => {
    const result = buildDecisionTradeoffs(
      {
        question: "Should I open a coffee shop within 6 months?",
        objective: "open a coffee shop",
        constraints: ["Timeframe: 6 months"],
        location: null,
        budget: null,
        timeframe: "6 months",
        preferences: [],
      },
      [
        {
          title: "Fast setup option",
          content: "A smaller coffee shop format can reduce setup time and simplify operations.",
          url: "https://example.com/setup",
          evidence_score: 80,
          relevance_score: 85,
          directness_score: 82,
          authority: { score: 78, type: "research" },
        },
        {
          title: "Longer setup option",
          content: "A larger coffee shop format can require more preparation and a longer setup period.",
          url: "https://example.com/large-setup",
          evidence_score: 78,
          relevance_score: 83,
          directness_score: 80,
          authority: { score: 78, type: "research" },
        },
      ],
    );

    expect(result.decisionFactors).toContain("Timeframe: 6 months");
    expect(result.tradeoffs.length).toBeGreaterThan(0);
  });
});
