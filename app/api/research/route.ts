import { classifyIntent } from "@/lib/intent-engine";
import { getAnswerRoute } from "@/lib/answer-routing";
import { createStudyResponse } from "@/lib/study-response";
import { buildStudyPrompt } from "@/lib/study-prompt";
import { createResearchLanguageContext } from "@/lib/research-language";
import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { runResearch } from "@/lib/research-runner";

const researchRateLimiter = createRateLimiter({
  limit: 10,
  windowMs: 10 * 60 * 1000,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (question.length > 4000) {
      return NextResponse.json(
        { error: "Question is too long." },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = researchRateLimiter.check(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many research requests. Please try again later." },
        { status: 429 },
      );
    }

    const languageContext = createResearchLanguageContext(question);
    const classification = classifyIntent(question);
    const answerRoute = getAnswerRoute(question, classification);

    if (answerRoute === "task") {
      const { routeTask } = await import("@/lib/task-routing");
      return NextResponse.json(routeTask(question));
    }

    if (answerRoute === "study") {
      const studyPrompt = buildStudyPrompt(
        question,
        languageContext.language.output,
      );

      if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          {
            error: "AI reasoning service is not configured.",
            missing: "OPENAI_API_KEY or GEMINI_API_KEY",
          },
          { status: 500 },
        );
      }

      try {
        const { generateJsonWithAI } = await import("@/lib/ai-json");
        const rawStudy = await generateJsonWithAI(studyPrompt);

        let parsedStudy: {
          explanation?: string;
          examples?: string[];
          practiceQuestions?: string[];
        };

        try {
          parsedStudy = JSON.parse(rawStudy);
        } catch {
          return NextResponse.json(
            { error: "The Study response was not valid JSON." },
            { status: 502 },
          );
        }

        const studyResponse = createStudyResponse({
          explanation: parsedStudy.explanation || "",
          examples: Array.isArray(parsedStudy.examples)
            ? parsedStudy.examples
            : [],
          practiceQuestions: Array.isArray(parsedStudy.practiceQuestions)
            ? parsedStudy.practiceQuestions
            : [],
        });

        return NextResponse.json(studyResponse);
      } catch (error) {
        console.error("Study AI generation failed:", error);
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Study response generation failed.",
          },
          { status: 502 },
        );
      }
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!tavilyKey) {
      return NextResponse.json(
        {
          error: "Tavily is not configured.",
          missing: "TAVILY_API_KEY",
        },
        { status: 500 }
      );
    }

    if (!openaiKey) {
      return NextResponse.json(
        {
          error: "AI reasoning service is not configured.",
          missing: "OPENAI_API_KEY",
        },
        { status: 500 }
      );
    }

    const researchResult = await runResearch(question);
    return NextResponse.json(researchResult);

  } catch (error) {
    console.error("BILLBLI research error:", error);

    return NextResponse.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "BILLBLI research engine failed.",
      },
      { status: 500 }
    );
  }
}
