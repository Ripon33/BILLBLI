import { describe, expect, it } from "vitest";
import { generateJsonWithAI } from "./ai-json";

describe("AI JSON helper", () => {
  it("exports a reusable JSON generation function", () => {
    expect(generateJsonWithAI).toBeTypeOf("function");
  });
});
