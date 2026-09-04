import { GoogleGenAI } from "@google/genai";

export async function generateJsonWithAI(prompt: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  let raw = "";

  if (openaiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      try {
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-5.6-luna",
            reasoning: {
              effort: "low",
            },
            input: prompt,
            store: false,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenAI HTTP ${response.status}: ${errorText.slice(0, 500)}`
          );
        }

        const data = await response.json();

        raw =
          data.output_text ||
          data.output
            ?.flatMap((item: any) => item.content || [])
            ?.filter(
              (item: any) =>
                item.type === "output_text" ||
                typeof item.text === "string"
            )
            ?.map((item: any) => item.text || "")
            ?.join("") ||
          "";
      } finally {
        clearTimeout(timeout);
      }

      raw = raw.trim();

      if (raw.startsWith("```")) {
        raw = raw
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
      }
    } catch (error) {
      console.error(
        "OpenAI primary failed; using Gemini fallback:",
        error
      );
    }
  }

  if (!raw && geminiKey) {
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
              message
            );

          if (!retryable || attempt === 1) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 800 * 2 ** attempt)
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
          : "The AI reasoning service is temporarily unavailable."
      );
    }

    raw = response.text || "";
  }

  if (!raw) {
    throw new Error("No AI response was generated.");
  }

  return raw.trim();
}
