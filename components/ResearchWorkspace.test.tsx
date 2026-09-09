import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResearchWorkspace, createResearchWorkspaceTranscriptHandler, createResearchWorkspaceSpeechCommand, createResearchWorkspaceSpeechController, createResearchWorkspaceSpeechCallbacks, createResearchWorkProposalHandler } from "./ResearchWorkspace";

describe("ResearchWorkspace speaking command", () => {
  it("applies a completed speaking transcript to the research question", () => {
    const onChange = vi.fn();

    const applyTranscript = createResearchWorkspaceTranscriptHandler(
      onChange,
    );

    applyTranscript("Compare supplier A and supplier B");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );
  });

  it("does not submit when a speaking transcript is applied", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    const applyTranscript = createResearchWorkspaceTranscriptHandler(
      onChange,
    );

    applyTranscript("Should we choose supplier A?");

    expect(onChange).toHaveBeenCalledWith(
      "Should we choose supplier A?",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ResearchWorkspace", () => {
  it("renders the core research interaction", () => {
    const html = renderToStaticMarkup(<ResearchWorkspace />);

    expect(html).toContain("Ask BILLBLI");
    expect(html).toContain("Ask a decision, not just a question.");
    expect(html).toContain("Research &amp; Decide");
    expect(html).toContain("Multiple sources");
    expect(html).toContain("Evidence &amp; conflicts");
    expect(html).toContain("Clear recommendation");
  });
});



describe("ResearchWorkspace result rendering", () => {
  it("renders a supplied research result with DecisionBox", () => {
    const result = {
      question: "Should we proceed?",
      analysis: {
        decision: "Proceed with the verified option.",
        confidence: 85,
        summary: "The evidence supports proceeding.",
      },
      sources: [
        {
          title: "Verified source",
          url: "https://example.com",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ResearchWorkspace result={result} />,
    );

    expect(html).toContain("Proceed with the verified option.");
    expect(html).toContain("Decision intelligence");
    expect(html).toContain("Verified source");
  });
});


describe("ResearchWorkspace submission integration", () => {
  it("creates a submission handler that returns the research result", async () => {
    const submitResearch = vi.fn().mockResolvedValue({
      analysis: {
        decision: "Proceed.",
        confidence: 90,
      },
    });

    const { createResearchWorkspaceHandler } = await import(
      "./ResearchWorkspace"
    );

    const handler = createResearchWorkspaceHandler(submitResearch);

    const result = await handler("Should we proceed?");

    expect(submitResearch).toHaveBeenCalledWith("Should we proceed?");
    expect(result).toEqual({
      analysis: {
        decision: "Proceed.",
        confidence: 90,
      },
    });
  });
});

describe("ResearchWorkspace speaking lifecycle", () => {
  it("starts with speaking idle state", () => {
    const html = renderToStaticMarkup(<ResearchWorkspace />);

    expect(html).toContain('aria-label="Use speaking command"');
    expect(html).toContain(">Speak<");
  });

  it("exposes speaking state to the composer", () => {
    const html = renderToStaticMarkup(<ResearchWorkspace />);

    expect(html).toContain("Ask BILLBLI");
    expect(html).not.toContain("Listening");
    expect(html).not.toContain("Transcribing");
  });
});

describe("ResearchWorkspace speech controller", () => {
  it("creates a speech command that starts and stops recognition", () => {
    const recognition = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onend: null,
      onerror: null,
    };

    const createRecognition = vi.fn(() => recognition);

    const speech = createResearchWorkspaceSpeechCommand(
      createRecognition,
      vi.fn(),
    );

    speech.start();
    speech.stop();

    expect(createRecognition).toHaveBeenCalledTimes(1);
    expect(recognition.start).toHaveBeenCalledTimes(1);
    expect(recognition.stop).toHaveBeenCalledTimes(1);
  });
});

describe("ResearchWorkspace speech lifecycle state", () => {
  it("transitions from idle to listening when speech starts", () => {
    const setState = vi.fn();

    const controller = createResearchWorkspaceSpeechController(setState);

    controller.start();

    expect(setState).toHaveBeenCalledWith("listening");
  });

  it("transitions from listening to transcribing when a transcript arrives", () => {
    const setState = vi.fn();
    const onTranscript = vi.fn();

    const controller = createResearchWorkspaceSpeechController(
      setState,
      onTranscript,
    );

    controller.start();
    controller.handleTranscript("Compare supplier A and supplier B");

    expect(setState).toHaveBeenLastCalledWith("transcribing");
    expect(onTranscript).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );
  });

  it("returns to idle when recognition ends", () => {
    const setState = vi.fn();

    const controller = createResearchWorkspaceSpeechController(setState);

    controller.start();
    controller.handleEnd();

    expect(setState).toHaveBeenLastCalledWith("idle");
  });

  it("does not submit when speech produces a transcript", () => {
    const setState = vi.fn();
    const onTranscript = vi.fn();
    const onSubmit = vi.fn();

    const controller = createResearchWorkspaceSpeechController(
      setState,
      onTranscript,
    );

    controller.handleTranscript("Should we choose supplier A?");

    expect(onTranscript).toHaveBeenCalledWith(
      "Should we choose supplier A?",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ResearchWorkspace speech command integration", () => {
  it("connects speech results to the research question without submitting", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const setState = vi.fn();

    const controller = createResearchWorkspaceSpeechController(
      setState,
      createResearchWorkspaceTranscriptHandler(onChange),
    );

    controller.start();
    controller.handleTranscript("Should we choose supplier A?");

    expect(setState).toHaveBeenNthCalledWith(1, "listening");
    expect(setState).toHaveBeenNthCalledWith(2, "transcribing");
    expect(onChange).toHaveBeenCalledWith(
      "Should we choose supplier A?",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ResearchWorkspace speech wiring", () => {
  it("creates speech callbacks for the composer", () => {
    const setState = vi.fn();
    const onChange = vi.fn();

    const callbacks = createResearchWorkspaceSpeechCallbacks(
      setState,
      createResearchWorkspaceTranscriptHandler(onChange),
    );

    callbacks.onStartSpeaking();

    expect(setState).toHaveBeenCalledWith("listening");

    callbacks.onTranscript("Compare supplier A and supplier B");

    expect(setState).toHaveBeenLastCalledWith("transcribing");
    expect(onChange).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );

    callbacks.onEnd();

    expect(setState).toHaveBeenLastCalledWith("idle");
  });
});

describe("ResearchWorkspace Work proposal", () => {
  it("renders an explicit Suggested Work proposal from a research result", () => {
    const result = {
      status: "researched" as const,
      answer: "The market is growing.",
      analysis: {
        summary: "Demand is increasing.",
        decision: "Proceed with further validation.",
        risks: [],
        what_would_change_the_decision: [],
      },
      sources: [],
      decision: {} as never,
      tradeoffs: {
        benefits: [],
        risks: [],
        tradeoffs: [],
        decisionFactors: [],
      },
      recommendation: {
        recommendation: "Validate the opportunity.",
        confidence: 80,
          why: [],
        next_steps: [],
      },
    };

    const html = renderToStaticMarkup(
      <ResearchWorkspace result={result} />,
    );

    expect(html).toContain("Suggested Work");
    expect(html).toContain("Create Work");
  });
});


describe("ResearchWorkspace Work proposal editing", () => {
  it("renders editable title and goal fields with an explicit create callback", () => {
    const result = {
      status: "researched" as const,
      answer: "The market is growing.",
      analysis: {
        summary: "Demand is increasing.",
        decision: "Proceed with further validation.",
        risks: [],
        what_would_change_the_decision: [],
      },
      sources: [],
      decision: {} as never,
      tradeoffs: {
        benefits: [],
        risks: [],
        tradeoffs: [],
        decisionFactors: [],
      },
      recommendation: {
        recommendation: "Validate the opportunity.",
        confidence: 80,
        next_steps: ["Validate the target market."],
        why: [],
      },
    };

    const onCreateWork = vi.fn();

    const html = renderToStaticMarkup(
      <ResearchWorkspace
        result={result}
        onCreateWork={onCreateWork}
      />,
    );

    expect(html).toContain('name="work-title"');
    expect(html).toContain('name="work-goal"');
    expect(html).toContain("Create Work");
  });
});


describe("ResearchWorkspace Work proposal creation", () => {
  it("creates reviewed Work input from the proposal values", () => {
    const onCreateWork = vi.fn();

    const submit = createResearchWorkProposalHandler(onCreateWork);

    submit({
      title: "Validate the opportunity.",
      goal: "Validate the target market.",
    });

    expect(onCreateWork).toHaveBeenCalledTimes(1);
    expect(onCreateWork).toHaveBeenCalledWith({
      title: "Validate the opportunity.",
      goal: "Validate the target market.",
    });
  });
});

describe("ResearchWorkspace Work proposal submission", () => {
  it("submits the reviewed Work input to the existing Work API", async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        work: {
          id: "work-123",
          title: "Validate the opportunity.",
          goal: "Validate the target market.",
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    ));

    vi.stubGlobal("fetch", fetchMock);

    const { submitResearchWorkProposal } = await import("./ResearchWorkspace");

    await submitResearchWorkProposal({
      title: "Validate the opportunity.",
      goal: "Validate the target market.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/work",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Validate the opportunity.",
          goal: "Validate the target market.",
        }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
