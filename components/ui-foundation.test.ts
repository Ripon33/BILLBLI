import { describe, expect, it } from "vitest";
import { BILLBLI_UI_TOKENS } from "./ui-foundation";

describe("BILLBLI UI foundation", () => {
  it("defines the approved light product visual tokens", () => {
    expect(BILLBLI_UI_TOKENS.background).toBe("#ffffff");
    expect(BILLBLI_UI_TOKENS.foreground).toBe("#171717");
    expect(BILLBLI_UI_TOKENS.accent).toBe("#16a34a");
    expect(BILLBLI_UI_TOKENS.border).toBe("#e5e7eb");
    expect(BILLBLI_UI_TOKENS.radius.md).toBe("12px");
  });
});

  it("defines the core spacing and typography tokens", () => {
    expect(BILLBLI_UI_TOKENS.space.sm).toBe("8px");
    expect(BILLBLI_UI_TOKENS.space.md).toBe("12px");
    expect(BILLBLI_UI_TOKENS.space.lg).toBe("16px");
    expect(BILLBLI_UI_TOKENS.space.xl).toBe("24px");
    expect(BILLBLI_UI_TOKENS.font.family).toBe(
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    );
    expect(BILLBLI_UI_TOKENS.font.bodySize).toBe("16px");
    expect(BILLBLI_UI_TOKENS.font.bodyLineHeight).toBe("1.5");
  });

  it("defines semantic status tokens for product states", () => {
    expect(BILLBLI_UI_TOKENS.status.success).toBe("#15803d");
    expect(BILLBLI_UI_TOKENS.status.warning).toBe("#a16207");
    expect(BILLBLI_UI_TOKENS.status.danger).toBe("#b91c1c");
    expect(BILLBLI_UI_TOKENS.status.info).toBe("#2563eb");
    expect(BILLBLI_UI_TOKENS.status.neutral).toBe("#6b7280");
  });

  it("defines restrained elevation and control radius tokens", () => {
    expect(BILLBLI_UI_TOKENS.shadow.card).toBe(
      "0 1px 2px rgb(0 0 0 / 0.05)",
    );
    expect(BILLBLI_UI_TOKENS.shadow.none).toBe("none");
    expect(BILLBLI_UI_TOKENS.radius.sm).toBe("8px");
    expect(BILLBLI_UI_TOKENS.radius.md).toBe("12px");
    expect(BILLBLI_UI_TOKENS.radius.lg).toBe("16px");
    expect(BILLBLI_UI_TOKENS.radius.full).toBe("9999px");
  });

  it("defines the approved CSS variable foundation in globals.css", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("app/globals.css", "utf8");

    expect(css).toContain("--billbli-bg: #ffffff");
    expect(css).toContain("--billbli-fg: #171717");
    expect(css).toContain("--billbli-accent: #16a34a");
    expect(css).toContain("--billbli-border: #e5e7eb");
    expect(css).toContain("--billbli-radius-md: 12px");
  });

  it("defines the approved global typography foundation in globals.css", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("app/globals.css", "utf8");

    expect(css).toContain("--billbli-font-family:");
    expect(css).toContain("--billbli-body-size: 16px");
    expect(css).toContain("--billbli-body-line-height: 1.5");
    expect(css).toContain("font-family: var(--billbli-font-family)");
  });

  it("defines a visible keyboard focus foundation in globals.css", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("app/globals.css", "utf8");

    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline");
  });

  it("defines a reduced-motion accessibility foundation in globals.css", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("app/globals.css", "utf8");

    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("scroll-behavior: auto");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(css).toContain("transition-duration: 0.01ms");
  });

  it("keeps core TypeScript and CSS foundation values aligned", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("app/globals.css", "utf8");

    expect(css).toContain(`--billbli-bg: ${BILLBLI_UI_TOKENS.background}`);
    expect(css).toContain(`--billbli-fg: ${BILLBLI_UI_TOKENS.foreground}`);
    expect(css).toContain(`--billbli-accent: ${BILLBLI_UI_TOKENS.accent}`);
    expect(css).toContain(`--billbli-border: ${BILLBLI_UI_TOKENS.border}`);
    expect(css).toContain(`--billbli-radius-md: ${BILLBLI_UI_TOKENS.radius.md}`);
  });
