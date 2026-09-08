import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StudyWorkspace } from "./StudyWorkspace";

describe("StudyWorkspace", () => {
  it("renders the core study interaction", () => {
    const html = renderToStaticMarkup(<StudyWorkspace />);

    expect(html).toContain("Ask BILLBLI");
    expect(html).toContain("Ask a decision, not just a question.");
    expect(html).toContain("Learn");
    expect(html).toContain("Examples");
    expect(html).toContain("Practice");
  });

  it("renders a supplied study result with StudyBox", () => {
    const result = {
      type: "study" as const,
      explanation: "A clear explanation of the topic.",
      examples: ["Example one", "Example two"],
      practiceQuestions: ["Question one", "Question two"],
    };

    const html = renderToStaticMarkup(
      <StudyWorkspace result={result} />,
    );

    expect(html).toContain("A clear explanation of the topic.");
    expect(html).toContain("Example one");
    expect(html).toContain("Question one");
  });
});

describe("StudyWorkspace submission integration", () => {
  it("creates a submission handler that returns the study result", async () => {
    const submitStudy = vi.fn().mockResolvedValue({
      type: "study",
      explanation: "Study result.",
      examples: [],
      practiceQuestions: [],
    });

    const { createStudyWorkspaceHandler } = await import("./StudyWorkspace");

    const handler = createStudyWorkspaceHandler(submitStudy);

    const result = await handler("Explain this topic.");

    expect(submitStudy).toHaveBeenCalledWith("Explain this topic.");
    expect(result).toEqual({
      type: "study",
      explanation: "Study result.",
      examples: [],
      practiceQuestions: [],
    });
  });
});

describe("StudyWorkspace history integration", () => {
  it("persists a successful Study result", async () => {
    const submitStudy = vi.fn().mockResolvedValue({
      type: "study",
      explanation: "Study result.",
      examples: [],
      practiceQuestions: [],
    });

    const saveHistory = vi.fn();

    const { createStudyWorkspaceHandler } = await import("./StudyWorkspace");

    const handler = createStudyWorkspaceHandler(
      submitStudy,
      saveHistory,
    );

    const result = await handler("Explain this topic.");

    expect(submitStudy).toHaveBeenCalledWith("Explain this topic.");
    expect(saveHistory).toHaveBeenCalledWith(
      "Explain this topic.",
      result,
    );
    expect(result).toEqual({
      type: "study",
      explanation: "Study result.",
      examples: [],
      practiceQuestions: [],
    });
  });
});

describe("StudyWorkspace local history integration", () => {
  it("exposes existing Study History when provided through the browser storage", async () => {
    const history = [
      {
        id: "study-1",
        question: "What is artificial intelligence?",
        createdAt: "2026-01-01T00:00:00.000Z",
        result: {
          type: "study" as const,
          explanation: "AI explained simply.",
          examples: [],
          practiceQuestions: [],
        },
      },
    ];

    const storage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(history)),
      setItem: vi.fn(),
    };

    const { createStudyWorkspaceHistoryLoader } =
      await import("./StudyWorkspace");

    const loadHistory = createStudyWorkspaceHistoryLoader(storage);

    expect(loadHistory()).toEqual(history);
    expect(storage.getItem).toHaveBeenCalledWith("billbli-study-history");
  });
});
