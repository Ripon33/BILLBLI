import { describe, expect, it } from "vitest";
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
});
