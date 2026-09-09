import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HistoryWorkspace from "./HistoryWorkspace";

describe("HistoryWorkspace", () => {
  it("renders separate research and study history sections", () => {
    const html = renderToStaticMarkup(<HistoryWorkspace />);

    expect(html).toContain("Research history");
    expect(html).toContain("Study history");
  });
});

import {
  deleteResearchHistoryItem,
  parseHistory,
  type ResearchHistoryItem,
} from "@/lib/research-history";
import {
  deleteStudyHistoryItem,
  STUDY_HISTORY_KEY,
} from "@/lib/study-history";

describe("HistoryWorkspace history behavior", () => {
  it("preserves the existing research and study history storage contracts", () => {
    expect(STUDY_HISTORY_KEY).toBe("billbli-study-history");

    const research = [
      {
        id: "research-1",
        question: "Research question",
        createdAt: new Date().toISOString(),
        result: {},
      },
    ] satisfies ResearchHistoryItem<Record<string, unknown>>[];

    const study = [
      {
        id: "study-1",
        question: "Study question",
        createdAt: new Date().toISOString(),
        result: {},
      },
    ] satisfies ResearchHistoryItem<Record<string, unknown>>[];

    const storage = {
      calls: [] as Array<[string, string]>,
      setItem(key: string, value: string) {
        this.calls.push([key, value]);
      },
    };

    const nextResearch = deleteResearchHistoryItem(
      storage,
      research,
      "research-1",
    );
    const nextStudy = deleteStudyHistoryItem(storage, study, "study-1");

    expect(nextResearch).toEqual([]);
    expect(nextStudy).toEqual([]);
    expect(storage.calls[0]?.[0]).toBe("billbli-research-history");
    expect(storage.calls[1]?.[0]).toBe(STUDY_HISTORY_KEY);

    expect(
      parseHistory<ResearchHistoryItem["result"]>(
        JSON.stringify(research),
      ),
    ).toHaveLength(1);
  });
});

describe("HistoryWorkspace restore navigation", () => {
  it("builds workspace restore links from an existing history item id", async () => {
    const {
      createHistoryRestoreHref,
    } = await import("./HistoryWorkspace");

    expect(createHistoryRestoreHref("research", "research-123")).toBe(
      "/workspace?restore=research-123&route=research",
    );

    expect(createHistoryRestoreHref("study", "study-456")).toBe(
      "/workspace?restore=study-456&route=study",
    );
  });
});

describe("HistoryWorkspace restore actions", () => {
  it("builds restore destinations for both history types", async () => {
    const { createHistoryRestoreHref } = await import("./HistoryWorkspace");

    expect(createHistoryRestoreHref("research", "r-1")).toBe(
      "/workspace?restore=r-1&route=research",
    );

    expect(createHistoryRestoreHref("study", "s-1")).toBe(
      "/workspace?restore=s-1&route=study",
    );
  });
});
