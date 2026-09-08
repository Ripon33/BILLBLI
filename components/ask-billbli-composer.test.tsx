import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AskBillbliComposer,
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
