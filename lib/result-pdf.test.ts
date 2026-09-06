import { describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createResearchPdfDocument,
  createStudyPdfDocument,
} from "./result-pdf";

describe("result PDF documents", () => {
  it("creates a Research PDF document with the important result sections", () => {
    const document = createResearchPdfDocument(
      "Should I invest?",
      {
        analysis: {
          decision: "Invest",
          confidence: 87,
          summary: "The evidence is favorable.",
          key_facts: [{ fact: "Revenue is growing." }],
          evidence_for: [{ point: "Strong demand." }],
          evidence_against: [{ point: "Market volatility." }],
          risks: ["Downside risk"],
          assumptions: ["Stable market"],
          conflicts: ["Source disagreement"],
          what_would_change_the_decision: ["Major revenue decline"],
        },
        sources: [
          {
            title: "Market Report",
            url: "https://example.com/report",
          },
        ],
      },
    );

    expect(document.title).toBe("BILLBLI Research Report");
    expect(document.filename).toBe("billbli-research-should-i-invest.pdf");
    expect(document.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ heading: "Question", content: "Should I invest?" }),
        expect.objectContaining({ heading: "Decision", content: "Invest" }),
        expect.objectContaining({ heading: "Confidence", content: "87%" }),
        expect.objectContaining({
          heading: "Summary",
          content: "The evidence is favorable.",
        }),
        expect.objectContaining({ heading: "Key facts" }),
        expect.objectContaining({ heading: "Evidence for" }),
        expect.objectContaining({ heading: "Evidence against" }),
        expect.objectContaining({ heading: "Risks" }),
        expect.objectContaining({ heading: "Assumptions" }),
        expect.objectContaining({ heading: "Conflicts" }),
        expect.objectContaining({ heading: "What would change the decision" }),
        expect.objectContaining({ heading: "Sources" }),
      ]),
    );
  });

  it("creates a Study PDF document with explanation, examples, and practice questions", () => {
    const document = createStudyPdfDocument(
      "What is inflation?",
      {
        type: "study",
        explanation: "Inflation means prices rise over time.",
        examples: ["Food becomes more expensive."],
        practiceQuestions: ["What causes inflation?"],
      },
    );

    expect(document.title).toBe("BILLBLI Study Guide");
    expect(document.filename).toBe("billbli-study-what-is-inflation.pdf");
    expect(document.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: "Question",
          content: "What is inflation?",
        }),
        expect.objectContaining({
          heading: "Explanation",
          content: "Inflation means prices rise over time.",
        }),
        expect.objectContaining({
          heading: "Examples",
          content: "• Food becomes more expensive.",
        }),
        expect.objectContaining({
          heading: "Practice questions",
          content: "• What causes inflation?",
        }),
      ]),
    );
  });

  it("keeps non-English question and result text unchanged", () => {
    const document = createStudyPdfDocument(
      "মুদ্রাস্ফীতি কী?",
      {
        type: "study",
        explanation: "মুদ্রাস্ফীতি হলো সময়ের সাথে পণ্যের দাম বৃদ্ধি।",
        examples: ["খাদ্যের দাম বেড়ে যায়।"],
        practiceQuestions: ["মুদ্রাস্ফীতির কারণ কী?"],
      },
    );

    expect(document.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: "Question",
          content: "মুদ্রাস্ফীতি কী?",
        }),
        expect.objectContaining({
          heading: "Explanation",
          content: "মুদ্রাস্ফীতি হলো সময়ের সাথে পণ্যের দাম বৃদ্ধি।",
        }),
      ]),
    );
  });
});

describe("result PDF Unicode support", () => {
  it("supports Bengali text in the PDF download generator", async () => {
    const fontPath = resolve(
      process.cwd(),
      "public/fonts/NotoSansBengali-Regular.ttf",
    );
    const fontBytes = await readFile(fontPath);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(fontBytes, {
          status: 200,
          headers: {
            "Content-Type": "font/ttf",
          },
        });
      }),
    );

    try {
      const { createPdfBlob } = await import("./result-pdf-download");

      const blob = await createPdfBlob(
        "BILLBLI Study Guide",
        [
          {
            heading: "Question",
            content: "মুদ্রাস্ফীতি কী?",
          },
          {
            heading: "Explanation",
            content: "মুদ্রাস্ফীতি হলো সময়ের সাথে পণ্যের দাম বৃদ্ধি।",
          },
        ],
      );

      expect(blob.type).toBe("application/pdf");
      expect(blob.size).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
