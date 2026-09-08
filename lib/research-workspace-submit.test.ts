import { describe, expect, it, vi } from "vitest";
import { createResearchWorkspaceSubmitHandler, submitResearchWorkspace } from "./research-workspace-submit";

describe("submitResearchWorkspace", () => {
  it("submits a research question through the existing research API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ decision: "Use the verified evidence." }),
    });

    const result = await submitResearchWorkspace(
      "What is the best option?",
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/research",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(result).toEqual({
      decision: "Use the verified evidence.",
    });
  });
});

describe("createResearchWorkspaceSubmitHandler", () => {
  it("passes the research result to the supplied callback", async () => {
    const result = { decision: "Use the verified evidence." };
    const submit = vi.fn().mockResolvedValue(result);
    const onResult = vi.fn();

    const handler = createResearchWorkspaceSubmitHandler(submit, onResult);

    await handler("What is the best option?");

    expect(submit).toHaveBeenCalledWith("What is the best option?");
    expect(onResult).toHaveBeenCalledWith(result);
  });
});
