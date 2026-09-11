import { OpenAIProvider } from "./ai/openai-provider";
import { buildStudyPrompt } from "./study-prompt";

export async function generateStudyWithAI(
  question: string,
  outputLanguage: string,
): Promise<string> {
  const provider = new OpenAIProvider();

  const result = await provider.generate({
    capability: "structured_json",
    mode: "balanced",
    input: buildStudyPrompt(question, outputLanguage),
  });

  const text = result.text.trim();

  if (!text) {
    throw new Error("No Study response was generated.");
  }

  return text;
}
