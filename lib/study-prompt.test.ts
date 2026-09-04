import { describe, expect, it } from "vitest";
import { buildStudyPrompt } from "./study-prompt";

describe("study prompt", () => {
  it("builds a learning-focused prompt without research requirements", () => {
    const prompt = buildStudyPrompt(
      "Explain quantum mechanics like I'm 15, then give me 5 questions to test my understanding.",
      "en",
    );

    expect(prompt).toContain("Explain quantum mechanics");
    expect(prompt).toContain("learning");
    expect(prompt).toContain("practice questions");
    expect(prompt).not.toContain("LIVE WEB EVIDENCE");
    expect(prompt).not.toContain("SOURCE 1");
  });
});
