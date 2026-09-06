import { describe, expect, it } from "vitest";
import { classifyIntent } from "./intent-engine";

describe("BILLBLI intent engine", () => {
  it("detects study help", () => {
    expect(
      classifyIntent("Explain photosynthesis to me like I am a beginner")
    ).toMatchObject({
      intent: "learn",
      mode: "study",
    });
  });

  it("detects exam preparation", () => {
    expect(
      classifyIntent("Help me prepare for my biology exam in 14 days")
    ).toMatchObject({
      intent: "plan",
      mode: "study",
    });
  });

  it("detects shopping decisions", () => {
    expect(
      classifyIntent("Which laptop should I buy for video editing?")
    ).toMatchObject({
      intent: "decide",
      mode: "shopping",
    });
  });

  it("detects research requests", () => {
    expect(
      classifyIntent("What does the research say about climate change?")
    ).toMatchObject({
      intent: "research",
      mode: "research",
    });
  });

  it("detects university decisions", () => {
    expect(
      classifyIntent("Which university should I choose for computer science?")
    ).toMatchObject({
      intent: "decide",
      mode: "education",
    });
  });

  it("detects business decisions", () => {
    expect(
      classifyIntent("Should I start a coffee shop in Cox's Bazar?")
    ).toMatchObject({
      intent: "decide",
      mode: "business",
    });
  });

  it("falls back to general decisions", () => {
    expect(
      classifyIntent("Should I move to a new city?")
    ).toMatchObject({
      intent: "decide",
      mode: "general",
    });
  });
});

describe("worldwide intent understanding", () => {
  it("recognizes study help in Bangla", () => {
    expect(
      classifyIntent("আমাকে সালোকসংশ্লেষণ বুঝিয়ে দাও")
    ).toMatchObject({
      intent: "learn",
      mode: "study",
    });
  });

  it("recognizes study help in Arabic", () => {
    expect(
      classifyIntent("اشرح لي عملية البناء الضوئي")
    ).toMatchObject({
      intent: "learn",
      mode: "study",
    });
  });

  it("recognizes shopping intent in Spanish", () => {
    expect(
      classifyIntent("¿Qué portátil debería comprar?")
    ).toMatchObject({
      intent: "decide",
      mode: "shopping",
    });
  });

  it("recognizes research intent in German", () => {
    expect(
      classifyIntent("Was sagt die Forschung über den Klimawandel?")
    ).toMatchObject({
      intent: "research",
      mode: "research",
    });
  });

  it("recognizes education decisions in French", () => {
    expect(
      classifyIntent("Quelle université devrais-je choisir pour l'informatique ?")
    ).toMatchObject({
      intent: "decide",
      mode: "education",
    });
  });

  it("recognizes mixed-language study help", () => {
    expect(
      classifyIntent("আমার exam-এর জন্য physicsটা বুঝিয়ে দাও")
    ).toMatchObject({
      intent: "learn",
      mode: "study",
    });
  });

  it("recognizes healthcare decisions", () => {
    expect(
      classifyIntent("Which treatment option should I discuss with my doctor?")
    ).toMatchObject({
      intent: "decide",
      mode: "healthcare",
    });
  });

  it("recognizes technology decisions", () => {
    expect(
      classifyIntent("Which programming framework should I choose?")
    ).toMatchObject({
      intent: "decide",
      mode: "technology",
    });
  });

  it("recognizes career decisions", () => {
    expect(
      classifyIntent("Should I change my career?")
    ).toMatchObject({
      intent: "decide",
      mode: "career",
    });
  });

  it("recognizes travel decisions", () => {
    expect(
      classifyIntent("Which destination should I visit for my vacation?")
    ).toMatchObject({
      intent: "decide",
      mode: "travel",
    });
  });
});

describe("multi-intent understanding", () => {
  it("detects learning plus education decision", () => {
    const result = classifyIntent(
      "Explain machine learning to me and then tell me which course I should take."
    );

    expect(result).toMatchObject({
      primaryIntent: "learn",
      primaryMode: "study",
      secondaryIntents: ["decide"],
      secondaryModes: ["education"],
    });
  });

  it("detects research plus shopping decision", () => {
    const result = classifyIntent(
      "Research these laptops and tell me which one I should buy."
    );

    expect(result).toMatchObject({
      primaryIntent: "research",
      primaryMode: "research",
      secondaryIntents: ["decide"],
      secondaryModes: ["shopping"],
    });
  });

  it("detects study planning plus learning", () => {
    const result = classifyIntent(
      "Explain calculus and create a study plan for my exam."
    );

    expect(result).toMatchObject({
      primaryIntent: "learn",
      primaryMode: "study",
      secondaryIntents: ["plan"],
      secondaryModes: ["study"],
    });
  });
});

describe("intent priority for mixed decisions", () => {
  it("prioritizes shopping decisions over study planning when university is context", () => {
    const result = classifyIntent(
      "Which laptop should I buy for university? Compare the latest models, prices, and battery life."
    );

    expect(result.primaryIntent).toBe("decide");
    expect(result.primaryMode).toBe("shopping");
  });
});

it("classifies an execution command as operations", () => {
  const result = classifyIntent("Send this report to my team.");

  expect(result).toMatchObject({
    primaryIntent: "execute",
    primaryMode: "operations",
  });
});

it("classifies a flight booking command as travel execution", () => {
  const result = classifyIntent("Book a flight to Dubai.");

  expect(result).toMatchObject({
    primaryIntent: "execute",
    primaryMode: "travel",
  });
});
