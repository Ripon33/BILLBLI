import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BillbliShell from "./BillbliShell";

vi.mock("./BillbliSidebar", () => ({
  default: () => (
    <aside aria-label="BILLBLI workspace sidebar">
      Mock sidebar
    </aside>
  ),
}));

describe("BILLBLI application shell", () => {
  it("renders authenticated navigation and the main content landmark", () => {
    const html = renderToStaticMarkup(
      <BillbliShell pathname="/workspace">
        <div>Workspace content</div>
      </BillbliShell>,
    );

    expect(html).toContain(
      'aria-label="BILLBLI workspace sidebar"',
    );
    expect(html).toContain(
      'aria-label="BILLBLI workspace content"',
    );
    expect(html).toContain("<main");
    expect(html).toContain("Workspace content");
  });

  it("provides a top utility area for authenticated workspace actions", () => {
    const html = renderToStaticMarkup(
      <BillbliShell pathname="/workspace">
        <div>Workspace content</div>
      </BillbliShell>,
    );

    expect(html).toContain(
      'aria-label="BILLBLI workspace utilities"',
    );
    expect(html).toContain("<header");
  });

  it("provides responsive mobile drawer semantics without forcing overflow", () => {
    const closed = renderToStaticMarkup(
      <BillbliShell pathname="/workspace" mobileSidebarOpen={false}>
        <div>Workspace content</div>
      </BillbliShell>,
    );

    const open = renderToStaticMarkup(
      <BillbliShell pathname="/workspace" mobileSidebarOpen>
        <div>Workspace content</div>
      </BillbliShell>,
    );

    expect(closed).not.toContain('aria-label="Close BILLBLI sidebar"');
    expect(open).toContain('aria-label="Close BILLBLI sidebar"');
    expect(open).toContain('class="fixed inset-0 z-30');
    expect(open).toContain("min-w-0 flex-1 flex-col");
    expect(open).toContain("min-w-0 flex-1");
  });

  it("renders caller-provided utility content inside the shared header", () => {
    const html = renderToStaticMarkup(
      <BillbliShell
        pathname="/workspace"
        utilityContent={<button type="button">New research</button>}
      >
        <div>Workspace content</div>
      </BillbliShell>,
    );

    expect(html).toContain('aria-label="BILLBLI workspace utilities"');
    expect(html).toContain("New research");
  });

});
