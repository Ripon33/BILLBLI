import { OpenAIProvider } from "./ai/openai-provider";

function normalizeJsonText(raw: string): string {
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  return text;
}

export async function generateJsonWithAI(prompt: string): Promise<string> {
  const provider = new OpenAIProvider();

  const result = await provider.generate({
    capability: "structured_json",
    mode: "balanced",
    input: prompt,
  });

  const text = result.text.trim();

  if (!text) {
    throw new Error("No AI response was generated.");
  }

  return normalizeJsonText(text);
}
