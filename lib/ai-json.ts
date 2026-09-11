import { GoogleGenAI } from "@google/genai";
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
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    try {
      const provider = new OpenAIProvider();

      const result = await provider.generate({
        capability: "structured_json",
        mode: "balanced",
        input: prompt,
      });

      if (result.text.trim()) {
        return normalizeJsonText(result.text);
      }
    } catch (error) {
      console.error(
        "OpenAI primary failed; using Gemini fallback:",
        error,
      );
    }
  }

  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const geminiModels = [
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ];

    let response: { text?: string } | undefined;
    let lastGeminiError: unknown;

    for (const model of geminiModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          break;
        } catch (error) {
          lastGeminiError = error;
          const message =
            error instanceof Error ? error.message : String(error);
          const retryable =
            /503|UNAVAILABLE|high demand|429|RESOURCE_EXHAUSTED|500|502|504/i.test(
              message,
            );

          if (!retryable || attempt === 1) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 800 * 2 ** attempt),
          );
        }
      }

      if (response) {
        break;
      }
    }

    if (!response) {
      throw new Error(
        lastGeminiError instanceof Error
          ? lastGeminiError.message
          : "The AI reasoning service is temporarily unavailable.",
      );
    }

    const raw = response.text || "";

    if (!raw) {
      throw new Error("No AI response was generated.");
    }

    return normalizeJsonText(raw);
  }

  throw new Error("No AI response was generated.");
}
