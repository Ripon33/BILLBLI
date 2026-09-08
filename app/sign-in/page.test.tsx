import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import SignInPage from "./page";

describe("sign-in page", () => {
  it("exports a sign-in page", () => {
    expect(SignInPage).toBeDefined();
  });

  it("contains email/password and Google sign-in controls", () => {
    const pageSource = SignInPage.toString();

    expect(pageSource).toContain("Email");
    expect(pageSource).toContain("Password");
    expect(pageSource).toContain("Sign in with Google");
  });

  it("renders the authentication form with BILLBLI styling", () => {
    const html = renderToStaticMarkup(<SignInPage />);

    expect(html).toContain("BILLBLI");
    expect(html).toContain("Sign in to continue");

    expect(html).toContain("billbli-card");
    expect(html).toContain("billbli-input");
    expect(html).toContain("billbli-button");
  });
});
