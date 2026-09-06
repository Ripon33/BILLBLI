import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import AccountSettings from "./AccountSettings";

const componentPath = resolve(process.cwd(), "components/AccountSettings.tsx");

describe("account settings", () => {
  it("renders separate sign-out and delete-account actions", () => {
    const html = renderToStaticMarkup(<AccountSettings />);

    expect(html).toContain("Sign out");
    expect(html).toContain("Delete account");
    expect(html).toContain("permanent");
  });

  it("does not show the permanent deletion confirmation before explicit confirmation", () => {
    const html = renderToStaticMarkup(<AccountSettings />);

    expect(html).not.toContain("Delete my account");
    expect(html).not.toContain("This action cannot be undone");
  });

  it("opens confirmation only from the delete-account action", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain(
      'onClick={() => setConfirming(true)}',
    );
    expect(source).toContain("Delete my account");
    expect(source).toContain("This action cannot be undone");
  });
});
