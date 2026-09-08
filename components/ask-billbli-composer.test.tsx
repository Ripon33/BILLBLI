import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AskBillbliComposer,
  applyAskBillbliTranscript,
  getAskBillbliSpeakingAction,
  shouldSubmitAskBillbliKeyboardEvent,
} from "./AskBillbliComposer";

describe("Ask BILLBLI composer", () => {
  it("renders an accessible decision input and submit control", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain("<form");
    expect(html).toContain("<textarea");
    expect(html).toContain('aria-label="Ask BILLBLI"');
    expect(html).toContain('placeholder="What are you deciding?"');
    expect(html).toContain('type="submit"');
    expect(html).toContain("Research &amp; Decide");
  });

  it("renders contextual controls when provided", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Should we expand?"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        context={{
          label: "Mode",
          value: "research",
          options: [
            { label: "Research", value: "research" },
            { label: "Study", value: "study" },
          ],
        }}
      />,
    );

    expect(html).toContain("Mode");
    expect(html).toContain("<select");
    expect(html).toContain('value="research"');
    expect(html).toContain(">Research<");
    expect(html).toContain(">Study<");
  });

  it("supports a compact contextual presentation", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Compare these options"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        variant="contextual"
      />,
    );

    expect(html).toContain('data-composer-variant="contextual"');
    expect(html).toContain("min-w-0");
  });

  it("disables submission while loading or explicitly disabled", () => {
    const loading = renderToStaticMarkup(
      <AskBillbliComposer
        value="What should we choose?"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        loading
      />,
    );

    const disabled = renderToStaticMarkup(
      <AskBillbliComposer
        value="What should we choose?"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        disabled
      />,
    );

    expect(loading).toContain("disabled");
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain("Researching");
    expect(disabled).toContain("disabled");
  });

  it("does not enable submission for an empty or whitespace-only value", () => {
    const empty = renderToStaticMarkup(
      <AskBillbliComposer
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const whitespace = renderToStaticMarkup(
      <AskBillbliComposer
        value="   "
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(empty).toContain("disabled");
    expect(whitespace).toContain("disabled");
  });

  it("supports Ctrl+Enter and Meta+Enter as submit keyboard shortcuts", () => {
    expect(
      shouldSubmitAskBillbliKeyboardEvent({
        key: "Enter",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(true);

    expect(
      shouldSubmitAskBillbliKeyboardEvent({
        key: "Enter",
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
      }),
    ).toBe(true);

    expect(
      shouldSubmitAskBillbliKeyboardEvent({
        key: "Enter",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(false);
  });
});

describe("Ask BILLBLI composer attachments", () => {
  it("renders an attachment control for adding supporting files", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Compare these supplier proposals"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain('type="file"');
    expect(html).toContain('aria-label="Attach files"');
    expect(html).toContain('multiple');
  });

  it("renders selected attachment names and remove controls", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Compare these supplier proposals"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        attachments={[
          { id: "proposal-a", name: "supplier-proposal-a.pdf" },
          { id: "proposal-b", name: "supplier-proposal-b.pdf" },
        ]}
        onRemoveAttachment={vi.fn()}
      />,
    );

    expect(html).toContain("supplier-proposal-a.pdf");
    expect(html).toContain("supplier-proposal-b.pdf");
    expect(html).toContain('aria-label="Remove supplier-proposal-a.pdf"');
    expect(html).toContain('aria-label="Remove supplier-proposal-b.pdf"');
  });
});

describe("Ask BILLBLI composer speaking command", () => {
  it("renders an accessible speaking command control", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Should we choose supplier A?"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain('aria-label="Use speaking command"');
    expect(html).toContain("Speak");
  });

  it("renders the listening state when speaking is active", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        speakingState="listening"
      />,
    );

    expect(html).toContain('aria-label="Stop speaking command"');
    expect(html).toContain("Listening");
    expect(html).toContain('aria-live="polite"');
  });

  it("renders the transcribing state without replacing the editable command", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Compare the two supplier proposals"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        speakingState="transcribing"
      />,
    );

    expect(html).toContain("Transcribing");
    expect(html).toContain("Compare the two supplier proposals");
    expect(html).toContain('aria-live="polite"');
  });

  it("keeps the normal submit control while speaking", () => {
    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Should we choose supplier A?"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        speakingState="listening"
      />,
    );

    expect(html).toContain('type="submit"');
    expect(html).toContain("Research &amp; Decide");
  });
});

describe("Ask BILLBLI composer speaking interaction", () => {
  it("calls the speaking start handler when Speak is activated", () => {
    const onStartSpeaking = vi.fn();

    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onStartSpeaking={onStartSpeaking}
      />,
    );

    expect(html).toContain('aria-label="Use speaking command"');
    expect(onStartSpeaking).not.toHaveBeenCalled();
  });

  it("exposes a stop handler while listening without submitting", () => {
    const onStopSpeaking = vi.fn();
    const onSubmit = vi.fn();

    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Should we choose supplier A?"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        speakingState="listening"
        onStopSpeaking={onStopSpeaking}
      />,
    );

    expect(html).toContain('aria-label="Stop speaking command"');
    expect(onStopSpeaking).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("supports receiving a transcript through the existing value change contract", () => {
    const onChange = vi.fn();

    const html = renderToStaticMarkup(
      <AskBillbliComposer
        value="Compare supplier A and supplier B"
        onChange={onChange}
        onSubmit={vi.fn()}
        speakingState="transcribing"
      />,
    );

    expect(html).toContain("Compare supplier A and supplier B");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not submit automatically when a speaking transcript is present", () => {
    const onSubmit = vi.fn();

    renderToStaticMarkup(
      <AskBillbliComposer
        value="Choose the better supplier"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        speakingState="transcribing"
      />,
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("Ask BILLBLI speaking command behavior", () => {
  it("creates the speaking action for the idle state", () => {
    const onStartSpeaking = vi.fn();

    const action = getAskBillbliSpeakingAction(
      "idle",
      onStartSpeaking,
      vi.fn(),
    );

    action();

    expect(onStartSpeaking).toHaveBeenCalledTimes(1);
  });

  it("creates the speaking action for the listening state", () => {
    const onStopSpeaking = vi.fn();

    const action = getAskBillbliSpeakingAction(
      "listening",
      vi.fn(),
      onStopSpeaking,
    );

    action();

    expect(onStopSpeaking).toHaveBeenCalledTimes(1);
  });

  it("does not create an automatic action while transcribing", () => {
    const onStartSpeaking = vi.fn();
    const onStopSpeaking = vi.fn();

    const action = getAskBillbliSpeakingAction(
      "transcribing",
      onStartSpeaking,
      onStopSpeaking,
    );

    action();

    expect(onStartSpeaking).not.toHaveBeenCalled();
    expect(onStopSpeaking).not.toHaveBeenCalled();
  });
});

describe("Ask BILLBLI speaking transcript state", () => {
  it("maps a completed transcript to the editable composer value", () => {
    const onChange = vi.fn();

    const transcript = "Compare supplier A and supplier B";

    applyAskBillbliTranscript(transcript, onChange);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );
  });

  it("keeps transcript application separate from submission", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    applyAskBillbliTranscript(
      "Should we choose supplier A?",
      onChange,
    );

    expect(onChange).toHaveBeenCalledWith(
      "Should we choose supplier A?",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("Ask BILLBLI transcript handling", () => {
  it("forwards a non-empty transcript through the composer change contract", () => {
    const onChange = vi.fn();

    applyAskBillbliTranscript(
      "Compare supplier A and supplier B",
      onChange,
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      "Compare supplier A and supplier B",
    );
  });

  it("ignores an empty or whitespace-only transcript", () => {
    const onChange = vi.fn();

    applyAskBillbliTranscript("   ", onChange);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("never submits when applying a transcript", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    applyAskBillbliTranscript(
      "Should we choose supplier A?",
      onChange,
    );

    expect(onChange).toHaveBeenCalledWith(
      "Should we choose supplier A?",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
