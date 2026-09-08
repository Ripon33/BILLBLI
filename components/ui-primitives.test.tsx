import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

describe("BILLBLI UI primitives", () => {
  it("renders an accessible button with a clear action label", () => {
    const html = renderToStaticMarkup(
      <Button type="button">Ask BILLBLI</Button>,
    );

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain("Ask BILLBLI");
  });

  it("supports disabled button semantics", () => {
    const html = renderToStaticMarkup(
      <Button type="button" disabled>
        Continue
      </Button>,
    );

    expect(html).toContain("disabled");
  });

  it("renders a card as a semantic content container", () => {
    const html = renderToStaticMarkup(
      <Card>
        <p>Active Work</p>
      </Card>,
    );

    expect(html).toContain("Active Work");
    expect(html).toContain('data-billbli="card"');
  });

  it("renders an accessible input with its supplied label", () => {
    const html = renderToStaticMarkup(
      <Input id="ask-billbli" label="Ask BILLBLI" />,
    );

    expect(html).toContain('id="ask-billbli"');
    expect(html).toContain('aria-label="Ask BILLBLI"');
  });
});
