import type { DecisionContext } from "./decision-context";
import { scoreResearchContextFit } from "./research-context";

export interface EvidenceSource {
  title?: string;
  content?: string;
  url?: string;
  score?: number;
}

export interface RankedEvidenceSource extends EvidenceSource {
  authority: {
    score: number;
    type: string;
  };
  relevance_score: number;
  directness_score: number;
  evidence_score: number;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "from", "with", "that", "this", "what",
  "how", "why", "when", "where", "which", "into", "about",
  "are", "can", "should", "would", "could", "best", "make",
  "does", "will", "than", "their", "they", "them", "your",
  "you", "our", "its", "use", "using", "2026", "2027",
]);

const CONCEPT_GROUPS = [
  ["coffee", "cafe", "cafes", "coffee-shop", "coffeeshop", "food-service"],
  ["shop", "store", "business", "restaurant", "cafe", "hotel"],
  ["start", "launch", "open", "opening", "establish", "setup"],
  ["tourism", "tourist", "visitors", "destination", "travel"],
  ["demand", "customers", "market", "opportunity", "growth"],
];

function conceptMatches(questionTerms: string[], sourceTerms: Set<string>) {
  let matches = 0;

  for (const group of CONCEPT_GROUPS) {
    const questionHasConcept = group.some((term) => questionTerms.includes(term));

    if (!questionHasConcept) continue;

    const sourceHasConcept = group.some((term) => sourceTerms.has(term));

    if (sourceHasConcept) {
      matches++;
    }
  }

  return matches;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function sourceRelevance(question: string, source: EvidenceSource) {
  const questionTerms = Array.from(new Set(tokenize(question)));

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

  const conceptMatchesCount =
    conceptMatches(questionTerms, titleTerms) +
    conceptMatches(questionTerms, contentTerms);

  const conceptScore = Math.min(
    100,
    conceptMatchesCount * 18
  );

  let score =
    titleRatio * 55 +
    contentRatio * 25 +
    conceptScore * 20;

  const tavilyScore =
    typeof source.score === "number"
      ? Math.max(0, Math.min(1, source.score))
      : 0;

  score = score * 0.85 + tavilyScore * 15;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function sourceDirectness(source: EvidenceSource) {
  const title = (source.title || "").toLowerCase();
  const content = (source.content || "").toLowerCase();

  let score = 50;

  if (title.length > 0) score += 10;
  if (content.length > 150) score += 10;

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

function getSourceAuthority(url?: string) {
  let hostname = "";

  try {
    hostname = new URL(url || "").hostname.toLowerCase();
  } catch {
    return {
      score: 10,
      type: "unknown",
    };
  }

  if (/\.gov$|\.gov\.[a-z]{2}$|\.gov\.[a-z]{2}\.[a-z]{2}$/.test(hostname)) {
    return { score: 98, type: "government" };
  }

  if (
    /\.edu$|\.ac\.uk$|university|^edu\./i.test(hostname)
  ) {
    return { score: 92, type: "academic" };
  }

  if (
    /who\.int|oecd\.org|worldbank\.org|imf\.org|un\.org|europa\.eu|ecb\.europa\.eu/i.test(
      hostname
    )
  ) {
    return { score: 96, type: "international_research_body" };
  }

  if (
    /sec\.gov|federalreserve\.gov|census\.gov/i.test(hostname)
  ) {
    return { score: 98, type: "official_data_regulator" };
  }

  if (
    /reuters\.com|apnews\.com|bbc\.com|ft\.com|bloomberg\.com|wsj\.com|nytimes\.com|economist\.com/i.test(
      hostname
    )
  ) {
    return { score: 85, type: "established_media" };
  }

  if (
    /facebook\.com|instagram\.com|tiktok\.com/i.test(hostname)
  ) {
    return { score: 25, type: "social" };
  }

  return {
    score: 50,
    type: "general_web_source",
  };
}

export function rankEvidenceSources(
  question: string,
  rawSources: EvidenceSource[],
  context?: DecisionContext,
): RankedEvidenceSource[] {
  const unique = new Map<string, EvidenceSource>();

  for (const source of rawSources) {
    const key = source.url || `${source.title || ""}:${source.content || ""}`;

    if (!unique.has(key)) {
      unique.set(key, source);
    }
  }

  const ranked = Array.from(unique.values())
    .map((source) => {
      const authority = getSourceAuthority(source.url);
      const relevance = sourceRelevance(question, source);
      const directness = sourceDirectness(source);
      const contextFit = context
        ? scoreResearchContextFit(question, source, context)
        : 0;

      const evidenceScore = Math.round(
        relevance * 0.50 +
        authority.score * 0.25 +
        directness * 0.15 +
        contextFit * (context ? 0.10 : 0) +
        Math.min(100, Math.max(0, (source.score ?? 0) * 100)) * (context ? 0.05 : 0.10)
      );

      return {
        ...source,
        authority,
        relevance_score: relevance,
        directness_score: directness,
        evidence_score: evidenceScore,
      };
    })
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

  const domainCounts = new Map<string, number>();
  const diverse: RankedEvidenceSource[] = [];

  for (const source of ranked) {
    let hostname = "";

    try {
      hostname = new URL(source.url || "")
        .hostname
        .replace(/^www\./, "")
        .toLowerCase();
    } catch {
      hostname = "unknown";
    }

    const count = domainCounts.get(hostname) ?? 0;

    const weakSource =
      source.authority.score <= 30 ||
      /personal|independent|social|user_generated|general_web_source/i.test(
        source.authority.type
      );

    // Generic/weak sources must demonstrate substantially stronger
    // evidence than authoritative sources before entering the final set.
    if (weakSource && source.evidence_score < 72) {
      continue;
    }

    if (
      source.authority.type === "general_web_source" &&
      source.evidence_score < 78
    ) {
      continue;
    }

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
