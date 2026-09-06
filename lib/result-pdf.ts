import type { StudyResponse } from "./study-response";

export type PdfSection = {
  heading: string;
  content: string;
};

export type PdfDocument = {
  title: string;
  filename: string;
  sections: PdfSection[];
};

type ResearchResult = {
  analysis?: {
    decision?: string;
    confidence?: number;
    summary?: string;
    key_facts?: { fact: string; sources?: number[] }[];
    evidence_for?: { point: string; sources?: number[] }[];
    evidence_against?: { point: string; sources?: number[] }[];
    risks?: string[];
    assumptions?: string[];
    conflicts?: string[];
    what_would_change_the_decision?: string[];
  };
  sources?: {
    title?: string;
    url?: string;
  }[];
};

function slugifyFilename(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "result"
  );
}

function addListSection(
  sections: PdfSection[],
  heading: string,
  items?: string[],
): void {
  if (!items?.length) return;

  sections.push({
    heading,
    content: items.map((item) => `• ${item}`).join("\n"),
  });
}

export function createResearchPdfDocument(
  question: string,
  result: ResearchResult,
): PdfDocument {
  const sections: PdfSection[] = [
    {
      heading: "Question",
      content: question,
    },
  ];

  const analysis = result.analysis;

  if (analysis?.decision) {
    sections.push({
      heading: "Decision",
      content: analysis.decision,
    });
  }

  if (typeof analysis?.confidence === "number") {
    sections.push({
      heading: "Confidence",
      content: `${analysis.confidence}%`,
    });
  }

  if (analysis?.summary) {
    sections.push({
      heading: "Summary",
      content: analysis.summary,
    });
  }

  addListSection(
    sections,
    "Key facts",
    analysis?.key_facts?.map((item) => item.fact),
  );

  addListSection(
    sections,
    "Evidence for",
    analysis?.evidence_for?.map((item) => item.point),
  );

  addListSection(
    sections,
    "Evidence against",
    analysis?.evidence_against?.map((item) => item.point),
  );

  addListSection(sections, "Risks", analysis?.risks);
  addListSection(sections, "Assumptions", analysis?.assumptions);
  addListSection(sections, "Conflicts", analysis?.conflicts);
  addListSection(
    sections,
    "What would change the decision",
    analysis?.what_would_change_the_decision,
  );

  if (result.sources?.length) {
    const sources = result.sources
      .map((source) => {
        if (source.title && source.url) {
          return `${source.title}\n${source.url}`;
        }

        return source.title || source.url || "";
      })
      .filter(Boolean);

    if (sources.length) {
      sections.push({
        heading: "Sources",
        content: sources.map((source) => `• ${source}`).join("\n"),
      });
    }
  }

  return {
    title: "BILLBLI Research Report",
    filename: `billbli-research-${slugifyFilename(question)}.pdf`,
    sections,
  };
}

export function createStudyPdfDocument(
  question: string,
  result: StudyResponse,
): PdfDocument {
  const sections: PdfSection[] = [
    {
      heading: "Question",
      content: question,
    },
    {
      heading: "Explanation",
      content: result.explanation,
    },
  ];

  addListSection(sections, "Examples", result.examples);
  addListSection(
    sections,
    "Practice questions",
    result.practiceQuestions,
  );

  return {
    title: "BILLBLI Study Guide",
    filename: `billbli-study-${slugifyFilename(question)}.pdf`,
    sections,
  };
}
