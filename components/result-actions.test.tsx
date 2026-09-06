import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultActions } from "./result-actions";

describe("ResultActions", () => {
  it("renders all shared actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(ResultActions, {
        route: "research",
        onDownload: () => {},
        onShare: () => {},
        onPrint: () => {},
        onDelete: () => {},
        onCopy: () => {},
      }),
    );

    expect(html).toContain("Download");
    expect(html).toContain("Share");
    expect(html).toContain("Print");
    expect(html).toContain("Delete");
    expect(html).toContain("Copy");
  });

  it("accepts a print action callback", () => {
    const onPrint = vi.fn();

    expect(onPrint).not.toHaveBeenCalled();

    const html = renderToStaticMarkup(
      React.createElement(ResultActions, {
        route: "research",
        onDownload: () => {},
        onShare: () => {},
        onPrint,
        onDelete: () => {},
        onCopy: () => {},
      }),
    );

    expect(html).toContain("Print");
  });
});

  it("wires the Share action to the provided callback", () => {
    const onShare = vi.fn();

    const html = renderToStaticMarkup(
      React.createElement(ResultActions, {
        route: "research",
        onDownload: () => {},
        onShare,
        onPrint: () => {},
        onDelete: () => {},
        onCopy: () => {},
      }),
    );

    expect(html).toContain('aria-label="Share"');
    expect(onShare).not.toHaveBeenCalled();
  });
