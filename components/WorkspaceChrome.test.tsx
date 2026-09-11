import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkspaceChrome from "./WorkspaceChrome";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/workspace/settings"),
}));

describe("WorkspaceChrome", () => {
  it("renders clickable authenticated workspace navigation", () => {
    const html = renderToStaticMarkup(
      <WorkspaceChrome>
        <div>Settings content</div>
      </WorkspaceChrome>,
    );

    expect(html).toContain('href="/workspace"');
    expect(html).toContain('href="/workspace/workers"');
    expect(html).toContain('href="/workspace/settings"');
    expect(html).toContain('href="/workspace/profile"');
    expect(html).toContain(">Settings<");
    expect(html).toContain(">Profile<");
    expect(html).toContain("Settings content");
  });
});
