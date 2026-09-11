import { rankEvidenceSources } from "./evidence-ranking";
import {
  buildResearchResultProvenance,
  buildGroundedClaimsFromResearchAnalysis,
} from "./evidence-provenance";
import { buildResearchLanguageInstruction } from "./research-synthesis";
import { createResearchLanguageContext } from "./research-language";
import { buildResearchQueries } from "./research-query";
import { buildResearchPlan } from "./research";
import { extractDecisionContext } from "./decision-context";
import {
  buildDecisionFactors,
  buildResearchDecision,
  extractStructuredEvidence,
} from "./decision-intelligence";
import { buildDecisionTradeoffs } from "./decision-tradeoff";
import { buildDecisionRecommendation } from "./decision-recommendation";
import { buildDecisionReassessment } from "./decision-reassessment";
import { buildDecisionActionPlan } from "./decision-action-plan";
import { buildUntrustedResearchContent } from "./untrusted-research-content";
import { OpenAIProvider } from "./ai/openai-provider";
import { withDecisionLanguage } from "./multilingual-decision";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

export type ResearchRunnerDependencies = {
  search?: (query: string) => Promise<TavilyResult[]>;
  generate?: (prompt: string) => Promise<string>;
};

export type ResearchRunnerResult = {
  status: "researched";
  question: string;
  plan: ReturnType<typeof buildResearchPlan>;
  analysis: {
    decision: string;
    confidence: number;
    summary: string;
    key_facts: Array<{
      fact: string;
      sources: number[];
    }>;
    evidence_for: Array<{
      point: string;
      sources: number[];
    }>;
    evidence_against: Array<{
      point: string;
      sources: number[];
    }>;
    risks: string[];
    assumptions: string[];
    conflicts: string[];
    what_would_change_the_decision: string[];
  };
  language: ReturnType<typeof createResearchLanguageContext>["language"];
  decision: ReturnType<typeof buildResearchDecision>["decision"];
  tradeoffs: ReturnType<typeof buildDecisionTradeoffs>;
  recommendation: ReturnType<typeof buildDecisionRecommendation>;
  reassessment: ReturnType<typeof buildDecisionReassessment>;
  actionPlan: ReturnType<typeof buildDecisionActionPlan>;
  provenance: ReturnType<typeof buildResearchResultProvenance>;
  sources: Array<{
    id: number;
    title: string;
    url: string;
    score: number | null;
    authority: number | null;
    authority_type: string;
  }>;
};

function defaultSearch(query: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("Tavily is not configured.");
  }

  return fetch("https://api.tavily.com/search", {
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
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Tavily error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return (data.results || []) as TavilyResult[];
  });
}

function fallbackAnalysis(raw: string): ResearchRunnerResult["analysis"] {
  return {
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

export async function runResearch(
  questionInput: string,
  dependencies: ResearchRunnerDependencies = {},
): Promise<ResearchRunnerResult> {
  const question = questionInput.trim();

  if (!question) {
    throw new Error("Question is required.");
  }

  if (question.length > 4000) {
    throw new Error("Question is too long.");
  }

  const languageContext = createResearchLanguageContext(question);
  const decisionContext = extractDecisionContext(question);
  const plan = buildResearchPlan(question, decisionContext);
  const queries = buildResearchQueries(question);

  const search = dependencies.search ?? defaultSearch;

  const searchResults = await Promise.all(
    queries.map((query) => search(query)),
  );

  const sourceMap = new Map<string, TavilyResult>();

  for (const results of searchResults) {
    for (const result of results) {
      if (result.url && !sourceMap.has(result.url)) {
        sourceMap.set(result.url, result);
      }
    }
  }

  const sources = rankEvidenceSources(
    question,
    Array.from(sourceMap.values()),
  );

  if (sources.length === 0) {
    throw new Error("No web sources were returned.");
  }

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
`,
    )
    .join("\n-------------------------\n");

  const untrustedEvidence = buildUntrustedResearchContent(evidence);

  const prompt = `
You are BILLBLI, an evidence-first decision intelligence system.

USER DECISION:
${question}

${buildResearchLanguageInstruction(languageContext.language.output)}

RESEARCH PLAN:
${JSON.stringify(plan, null, 2)}

LIVE WEB EVIDENCE:
${untrustedEvidence}

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

  let raw: string;

  if (dependencies.generate) {
    raw = (await dependencies.generate(prompt)).trim();
  } else {
    const provider = new OpenAIProvider();

    const result = await provider.generate({
      capability: "research",
      mode: "balanced",
      input: prompt,
    });

    raw = result.text.trim();
  }

  let analysis: ResearchRunnerResult["analysis"];

  try {
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
      ...JSON.parse(raw),
    };
  } catch {
    analysis = fallbackAnalysis(raw);
  }

  const provenanceBase = buildResearchResultProvenance(sources);
  const groundedProvenance = buildGroundedClaimsFromResearchAnalysis(
    analysis,
    provenanceBase,
  );

  const v2Sources = sources.map((source, index) => ({
    id: `source-${index + 1}`,
    text: source.content || "",
    title: source.title || "Untitled",
    url: source.url || "",
  }));

  const v2Evidence = extractStructuredEvidence(v2Sources);

  const tradeoffResult = buildDecisionTradeoffs(decisionContext, sources);
  const v2Factors = buildDecisionFactors(v2Evidence);

  const v2Decision = buildResearchDecision({
    question,
    sources: v2Sources,
    evidence: v2Evidence,
    factors: v2Factors,
  });

  const provenance = buildResearchResultProvenance(
    sources,
    groundedProvenance.claims,
    groundedProvenance.links,
    v2Decision.decision.conflicts,
  );

  if (!v2Decision.valid) {
    throw new Error(
      `BILLBLI decision validation failed: ${v2Decision.errors.join("; ")}`,
    );
  }

  const recommendation = buildDecisionRecommendation({
    score: v2Decision.decision.decision.score,
    confidence: v2Decision.decision.decision.confidence,
    risks: tradeoffResult.risks,
    tradeoffs: tradeoffResult.tradeoffs,
  });

  const reassessment = buildDecisionReassessment({
    recommendation: recommendation.recommendation,
    confidence: recommendation.confidence,
    risks: recommendation.risks,
    tradeoffs: recommendation.tradeoffs,
  });

  const actionPlan = buildDecisionActionPlan({
    recommendation: recommendation.recommendation,
    confidence: recommendation.confidence,
    decisionFactors: tradeoffResult.decisionFactors,
    risks: tradeoffResult.risks,
    tradeoffs: tradeoffResult.tradeoffs,
  });

  return {
    status: "researched",
    question,
    plan,
    analysis,
    language: languageContext.language,
    decision: withDecisionLanguage(v2Decision.decision, question),
    tradeoffs: tradeoffResult,
    recommendation,
    reassessment,
    actionPlan,
    provenance,
    sources: sources.map((source, index) => ({
      id: index + 1,
      title: source.title || "Untitled",
      url: source.url || "",
      score: source.score ?? null,
      authority: source.authority?.score ?? null,
      authority_type: source.authority?.type ?? "unknown",
    })),
  };
}
