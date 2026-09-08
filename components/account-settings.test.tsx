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

  it("does not show permanent deletion confirmation initially", () => {
    const html = renderToStaticMarkup(<AccountSettings />);

    expect(html).not.toContain("Delete my account");
    expect(html).not.toContain("This action cannot be undone");
  });

  it("keeps account deletion behind explicit confirmation", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain("setConfirming(true)");
    expect(source).toContain("Delete my account");
    expect(source).toContain("This action cannot be undone");
    expect(source).toContain("onClick={handleDeleteAccount}");
  });

  it("wires sign out to the browser Supabase auth client", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain('createClient } from "@/lib/supabase/client"');
    expect(source).toContain("supabase.auth.signOut()");
  });

  it("calls the server account-deletion endpoint", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain('fetch("/api/account/delete"');
    expect(source).toContain('method: "POST"');
  });

  it("does not import the server-only account deletion service", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).not.toContain('deleteCurrentAccount');
    expect(source).not.toContain("@/lib/auth/account-deletion");
  });

  it("redirects to sign-in after successful authentication actions", () => {
    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain('window.location.assign("/sign-in")');
  });
});
