import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AuthNav from "./AuthNav";

describe("authenticated navigation", () => {
  it("renders all required workspace navigation items", () => {
    const html = renderToStaticMarkup(<AuthNav />);

    expect(html).toContain('href="/workspace"');
    expect(html).toContain(">Home<");
    expect(html).toContain(">Research<");
    expect(html).toContain(">Study<");
    expect(html).toContain(">Decisions<");
    expect(html).toContain(">Tasks<");
    expect(html).toContain(">History<");
    expect(html).toContain(">Settings<");
    expect(html).toContain(">Profile<");
    expect(html).toContain(">Sign out<");
  });
});
