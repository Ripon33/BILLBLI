import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BillbliSidebar from "./BillbliSidebar";

describe("BILLBLI sidebar", () => {
  it("renders the complete authenticated workspace navigation", () => {
    const html = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" />,
    );

    expect(html).toContain("BILLBLI");
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

  it("marks the current route as active without relying on color alone", () => {
    const html = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace/decisions" />,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/workspace/decisions"');
  });

  it("provides an accessible collapse control", () => {
    const html = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" />,
    );

    expect(html).toContain('aria-label="Collapse sidebar"');
  });

  it("supports an expanded and collapsed presentation", () => {
    const expanded = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" collapsed={false} />,
    );
    const collapsed = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" collapsed />,
    );

    expect(expanded).toContain('data-sidebar-state="expanded"');
    expect(collapsed).toContain('data-sidebar-state="collapsed"');
  });

  it("provides a mobile drawer close control", () => {
    const html = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" mobileOpen />,
    );

    expect(html).toContain('aria-label="Close sidebar"');
  });

  it("exposes a stable sidebar preference key", () => {
    const html = renderToStaticMarkup(
      <BillbliSidebar pathname="/workspace" />,
    );

    expect(html).toContain('data-sidebar-preference="billbli-sidebar-collapsed"');
  });
});
