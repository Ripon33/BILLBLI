import { buildResearchLanguageInstruction } from "@/lib/research-synthesis";
import { createResearchLanguageContext } from "@/lib/research-language";
import { buildResearchQueries } from "@/lib/research-query";
import { withDecisionLanguage } from "@/lib/multilingual-decision";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildResearchPlan } from "@/lib/research";
import { buildDecisionFactors, buildResearchDecision, extractStructuredEvidence } from "@/lib/decision-intelligence";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

function getSourceAuthority(url?: string) {
  if (!url) {
    return { score: 10, type: "unknown" };
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (
      hostname.endsWith(".gov") ||
      hostname.endsWith(".gov.uk") ||
      hostname.endsWith(".gov.au") ||
      hostname.includes(".gov.")
    ) {
      return { score: 98, type: "government_or_regulator" };
    }

    if (
      hostname.endsWith(".edu") ||
      hostname.endsWith(".ac.uk") ||
      hostname.includes("university") ||
      hostname.includes("edu.")
    ) {
      return { score: 92, type: "academic_or_research" };
    }

    if (
      hostname.includes("who.int") ||
      hostname.includes("oecd.org") ||
      hostname.includes("worldbank.org") ||
      hostname.includes("imf.org") ||
      hostname.includes("un.org") ||
      hostname.includes("europa.eu") ||
      hostname.includes("ecb.europa.eu")
    ) {
      return { score: 96, type: "international_or_research_body" };
    }

    if (
      hostname.includes("sec.gov") ||
      hostname.includes("federalreserve.gov") ||
      hostname.includes("census.gov")
    ) {
      return { score: 98, type: "official_data_or_regulator" };
    }

    if (
      hostname.includes("reuters.com") ||
      hostname.includes("apnews.com") ||
      hostname.includes("bbc.com") ||
      hostname.includes("ft.com") ||
      hostname.includes("bloomberg.com") ||
      hostname.includes("wsj.com") ||
      hostname.includes("nytimes.com") ||
      hostname.includes("economist.com")
    ) {
      return { score: 85, type: "established_news_or_business_media" };
    }

    if (
      hostname.includes("facebook.com") ||
      hostname.includes("instagram.com") ||
      hostname.includes("tiktok.com") ||
      hostname.includes("youtube.com") ||
      hostname.includes("x.com") ||
      hostname.includes("twitter.com") ||
      hostname.includes("linkedin.com")
    ) {
      return { score: 15, type: "social_or_user_generated" };
    }

    if (
      hostname.includes("medium.com") ||
      hostname.includes("substack.com") ||
      hostname.includes("wordpress.com") ||
      hostname.includes("blogspot.com")
    ) {
      return { score: 30, type: "personal_or_independent_blog" };
    }

    if (
      hostname.startsWith("docs.") ||
      hostname.includes("developer.") ||
      hostname.includes("research.")
    ) {
      return { score: 70, type: "technical_or_research_documentation" };
    }

    return { score: 50, type: "general_web_source" };
  } catch {
    return { score: 10, type: "invalid_or_unknown_source" };
  }
}


function normalizeSourceUrl(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function sourceRelevance(question: string, source: TavilyResult) {
  const stopWords = new Set([
    "the", "and", "for", "from", "with", "that", "this", "what",
    "how", "why", "when", "where", "which", "into", "about",
    "are", "can", "should", "would", "could", "best", "make",
    "does", "will", "than", "their", "they", "them", "your",
    "you", "our", "its", "use", "using", "2026", "2027"
  ]);

  const tokenize = (value: string) =>
    value
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(/^-+|-+$/g, ""))
      .filter((word) => word.length >= 3 && !stopWords.has(word));

  const questionTerms = Array.from(
    new Set(tokenize(question))
  );

  if (questionTerms.length === 0) return 50;

  const titleTerms = new Set(tokenize(source.title || ""));
  const contentTerms = new Set(tokenize(source.content || ""));

  let titleMatches = 0;
  let contentMatches = 0;

  for (const term of questionTerms) {
    if (titleTerms.has(term)) titleMatches++;
    if (contentTerms.has(term)) contentMatches++;
  }

  const titleRatio = titleMatches / questionTerms.length;
  const contentRatio = contentMatches / questionTerms.length;

  // Title matches are stronger evidence of topical relevance.
  let score = titleRatio * 70 + contentRatio * 30;

  // Preserve Tavily's retrieval signal, but never let it dominate relevance.
  const tavilyScore =
    typeof source.score === "number"
      ? Math.max(0, Math.min(1, source.score))
      : 0;

  score = score * 0.85 + tavilyScore * 15;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function sourceDirectness(source: TavilyResult) {
  const title = (source.title || "").toLowerCase();
  const content = (source.content || "").toLowerCase();

  let score = 50;

  if (title.length > 0) score += 10;
  if (content.length > 150) score += 10;

  // Prefer sources whose title directly describes evidence,
  // rather than generic collections or promotional pages.
  if (
    /statistics|data|report|study|research|survey|forecast|market|analysis|official/i.test(
      title
    )
  ) {
    score += 20;
  }

  if (/top \d+|best \d+|ideas|ways to make money|side hustles/i.test(title)) {
    score -= 15;
  }

  if (/sponsored|advertisement|affiliate/i.test(content)) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

function rankSources(question: string, rawSources: TavilyResult[]) {
  const unique = new Map<string, TavilyResult>();

  for (const source of rawSources) {
    const key = normalizeSourceUrl(source.url);

    if (!key) continue;

    const existing = unique.get(key);

    if (!existing || (source.score ?? 0) > (existing.score ?? 0)) {
      unique.set(key, source);
    }
  }

  const ranked = Array.from(unique.values())
    .map((source) => {
      const authority = getSourceAuthority(source.url);
      const relevance = sourceRelevance(question, source);
      const directness = sourceDirectness(source);

      // Relevance is deliberately the largest component.
      const evidenceScore = Math.round(
        relevance * 0.50 +
        authority.score * 0.25 +
        directness * 0.15 +
        Math.min(100, Math.max(0, (source.score ?? 0) * 100)) * 0.10
      );

      return {
        ...source,
        authority,
        relevance_score: relevance,
        directness_score: directness,
        evidence_score: evidenceScore,
      };
    })
    // Do not allow authority alone to rescue an irrelevant source.
    .filter(
      (source) =>
        source.relevance_score >= 25 ||
        source.evidence_score >= 65
    )
    .sort((a, b) => {
      if (b.evidence_score !== a.evidence_score) {
        return b.evidence_score - a.evidence_score;
      }

      return b.authority.score - a.authority.score;
    });

  // Keep the evidence set focused and diverse.
  // Do not allow one publisher/domain to dominate the evidence set.
  const domainCounts = new Map<string, number>();
  const diverse = [];

  for (const source of ranked) {
    let hostname = "";

    try {
      hostname = new URL(source.url || "").hostname
        .replace(/^www\./, "")
        .toLowerCase();
    } catch {
      hostname = "unknown";
    }

    const count = domainCounts.get(hostname) ?? 0;

    // Weak discovery sources are allowed only when they provide
    // unusually strong topical evidence.
    const weakSource =
      source.authority.score <= 30 ||
      /personal|independent|social|user_generated|general_web_source/i.test(
        source.authority.type
      );

    if (weakSource && source.evidence_score < 72) {
      continue;
    }

    // Maximum two sources from the same domain.
    if (count >= 2) {
      continue;
    }

    domainCounts.set(hostname, count + 1);
    diverse.push(source);

    if (diverse.length >= 12) {
      break;
    }
  }

  return diverse;
}

async function tavilySearch(query: string, apiKey: string) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily error ${response.status}: ${text}`);
  }

  const data = await response.json();

  return (data.results || []) as TavilyResult[];
}

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

    const languageContext = createResearchLanguageContext(question);

  const tavilyKey = process.env.TAVILY_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!tavilyKey) {
      return NextResponse.json(
        {
          error: "Tavily is not configured.",
          missing: "TAVILY_API_KEY",
        },
        { status: 500 }
      );
    }

    if (!geminiKey) {
      return NextResponse.json(
        {
          error: "Gemini is not configured.",
          missing: "GEMINI_API_KEY",
        },
        { status: 500 }
      );
    }

    // 1. Create BILLBLI's research plan.
    const plan = buildResearchPlan(question);

    // 2. Turn the plan into focused research queries.
    const queries = buildResearchQueries(question);

    // 3. Search the live web in parallel.
    const searchResults = await Promise.all(
      queries.map((query) => tavilySearch(query, tavilyKey))
    );

    // 4. Deduplicate sources.
    const sourceMap = new Map<string, TavilyResult>();

    for (const results of searchResults) {
      for (const result of results) {
        if (result.url && !sourceMap.has(result.url)) {
          sourceMap.set(result.url, result);
        }
      }
    }
  const sources = rankSources(
    question,
    Array.from(sourceMap.values())
  );


    if (sources.length === 0) {
      return NextResponse.json(
        {
          error: "No web sources were returned.",
          status: "research_failed",
        },
        { status: 502 }
      );
    }

    // 5. Build evidence for the reasoning model.
    const evidence = sources
      .map(
        (source, index) => `
SOURCE ${index + 1}
Title: ${source.title || "Untitled"}
URL: ${source.url || ""}
Relevance score: ${source.score ?? "unknown"}
Authority: ${source.authority.score}/100 (${source.authority.type})

Content:
${source.content || ""}
`
      )
      .join("\n-------------------------\n");

    // 6. Ask Gemini to reason over the collected evidence.
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
    });

    const prompt = `
You are BILLBLI, an evidence-first decision intelligence system.

USER DECISION:
${question}

${buildResearchLanguageInstruction(languageContext.language.output)}

RESEARCH PLAN:
${JSON.stringify(plan, null, 2)}

LIVE WEB EVIDENCE:
${evidence}

Your task is to make a defensible decision from the evidence.

Rules:
- Do not invent facts.
- Separate facts from inference.
- Identify assumptions.
- Identify evidence for and against the decision.
- Identify conflicting or weak evidence.
- Prefer recent and authoritative sources when possible.
- Do not treat a search snippet as proof when the evidence is insufficient.
- If evidence is insufficient, explicitly say so.
- Every important factual claim should reference one or more SOURCE numbers.
- Confidence must reflect evidence quality, not certainty of the model.

SOURCE INTELLIGENCE RULES:
1. Treat primary and authoritative sources as stronger evidence than opinion, marketing, aggregator, or generic blog sources.
2. Prefer government agencies, official regulators, universities, standards bodies, company filings, official company documentation, and original research when available.
3. Never treat a search-result relevance score as proof that a claim is true.
4. Every material factual claim must be supported by one or more supplied sources.
5. Only cite a source when its provided content actually supports the claim. Do not cite a source merely because it is topically related.
6. Separate FACTS from INFERENCES and FORECASTS. Never present an inference or forecast as an established fact.
7. If evidence is weak, conflicting, outdated, or insufficient, explicitly say so and reduce confidence.
8. When sources disagree, identify the conflict instead of silently choosing one.
9. Do not invent statistics, market sizes, dates, regulations, company facts, or forecasts.
10. Avoid absolute claims such as "certainly", "universally", "guaranteed", or "will" unless the evidence genuinely supports that certainty.
11. Recommendations must be derived from the supplied evidence and the user's actual question, not generic lists of popular businesses.
12. Confidence must reflect evidence quality, consistency, recency, and directness.
13. For future-year questions, clearly label forecasts as forecasts and state the assumptions behind them.
14. Identify the evidence or conditions most likely to change the recommendation.

Return ONLY valid JSON with this exact structure:

{
  "decision": "Recommended action in one sentence",
  "confidence": 0,
  "summary": "Short explanation of the decision",
  "key_facts": [
    {
      "fact": "Factual statement",
      "sources": [1, 2]
    }
  ],
  "evidence_for": [
    {
      "point": "Evidence supporting the decision",
      "sources": [1]
    }
  ],
  "evidence_against": [
    {
      "point": "Evidence against the decision",
      "sources": [3]
    }
  ],
  "risks": [
    "Risk"
  ],
  "assumptions": [
    "Assumption"
  ],
  "conflicts": [
    "Conflicting evidence or uncertainty"
  ],
  "what_would_change_the_decision": [
    "Condition"
  ]
}

confidence must be an integer from 0 to 100.
`;

  let response;

  const geminiModels = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
  ];

  let lastGeminiError: unknown;

  let raw = "";
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      let openaiResponse: Response;

      try {
        openaiResponse = await fetch("https://api.openai.com/v1/responses", {
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
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("OpenAI request timeout after 120 seconds");
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        throw new Error(
          `OpenAI HTTP ${openaiResponse.status}: ${errorText.slice(0, 500)}`
        );
      }

      const openaiData = await openaiResponse.json();

      raw =
      openaiData.output_text ||
      openaiData.output
        ?.flatMap((item: any) => item.content || [])
        ?.filter(
          (item: any) =>
            item.type === "output_text" ||
            typeof item.text === "string"
        )
        ?.map((item: any) => item.text || "")
        ?.join("") ||
      "";

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


  if (!raw) {
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
      "The AI reasoning service is temporarily unavailable."
    );
  }

    raw = response.text || "";
  }

    let analysis;

    try {
      analysis = JSON.parse(raw);
    } catch {
      analysis = {
        decision: "Unable to produce a structured decision.",
        confidence: 0,
        summary: raw,
        key_facts: [],
        evidence_for: [],
        evidence_against: [],
        risks: [],
        assumptions: [],
        conflicts: [],
        what_would_change_the_decision: [],
      };
    }

    // 7. Build the validated V2 decision object from researched sources.
  const v2Sources = sources.map((source, index) => ({
    id: `source-${index + 1}`,
    text: source.content || "",
    title: source.title || "Untitled",
    url: source.url || "",
  }));

  const v2Evidence = extractStructuredEvidence(v2Sources);

  const v2Factors = buildDecisionFactors(v2Evidence);

  const v2Decision = buildResearchDecision({
    question,
    sources: v2Sources,
    evidence: v2Evidence,
    factors: v2Factors,
  });

  if (!v2Decision.valid) {
    throw new Error(`BILLBLI decision validation failed: ${v2Decision.errors.join("; ")}`);
  }

  const decisionWithLanguage = withDecisionLanguage(

    v2Decision.decision,

    question,

  );


  // 8. Return the complete BILLBLI research result.

    return NextResponse.json({
      status: "researched",
      question,
      plan,
      analysis,
      language: languageContext.language,
      decision: decisionWithLanguage,
      sources: sources.map((source, index) => ({
        id: index + 1,
        title: source.title || "Untitled",
        url: source.url || "",
        score: source.score ?? null,
      authority: source.authority?.score ?? null,
      authority_type: source.authority?.type ?? "unknown",
      })),
    });
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
