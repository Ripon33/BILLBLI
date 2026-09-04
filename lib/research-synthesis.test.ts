import { describe, expect, it } from "vitest";
import { buildResearchLanguageInstruction } from "./research-synthesis";

describe("research synthesis language instruction", () => {
  it("requires Bangla output for a Bangla decision", () => {
    const instruction = buildResearchLanguageInstruction("bn");

    expect(instruction).toContain("Bangla");
    expect(instruction).toContain("Respond entirely");
  });

  it("requires Arabic output for an Arabic decision", () => {
    const instruction = buildResearchLanguageInstruction("ar");

    expect(instruction).toContain("Arabic");
    expect(instruction).toContain("Respond entirely");
  });

  it("requires English output for an English decision", () => {
    const instruction = buildResearchLanguageInstruction("en");

    expect(instruction).toContain("English");
    expect(instruction).toContain("Respond entirely");
  });

  it("preserves source titles, URLs, and direct quotes when necessary", () => {
    const instruction = buildResearchLanguageInstruction("bn");

    expect(instruction).toContain("source titles");
    expect(instruction).toContain("URLs");
    expect(instruction).toContain("direct quotes");
  });
});
