import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/research security boundary", () => {
  it("rejects a question longer than 4000 characters", async () => {
    const request = new Request("http://localhost/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "a".repeat(4001),
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Question is too long.",
    });
  });

  it("does not consume a rate-limit slot for an oversized question", async () => {
    const ip = "203.0.113.12";

    const oversizedRequest = new Request("http://localhost/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({
        question: "a".repeat(4001),
      }),
    });

    const oversizedResponse = await POST(oversizedRequest);

    expect(oversizedResponse.status).toBe(400);

    for (let i = 0; i < 10; i++) {
      const request = new Request("http://localhost/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({
          question: "What is the best option?",
        }),
      });

      const response = await POST(request);

      expect(response.status).not.toBe(429);
    }
  });

  it("blocks the 11th research request from the same IP", async () => {
    const requests = Array.from({ length: 11 }, () =>
      new Request("http://localhost/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({
          question: "What is the best option?",
        }),
      }),
    );

    const responses = [];

    for (const request of requests) {
      responses.push(await POST(request));
    }

    expect(responses.slice(0, 10).every((response) => response.status !== 429)).toBe(
      true,
    );
    expect(responses[10].status).toBe(429);
    await expect(responses[10].json()).resolves.toEqual({
      error: "Too many research requests. Please try again later.",
    });
  });

  it("returns a structured task for execution commands", async () => {
    const request = new Request("http://localhost/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.20",
      },
      body: JSON.stringify({
        question: "Book a flight to Dubai.",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      route: "task",
      task: {
        intent: "execute",
        domain: "travel",
        goal: "book_flight",
        requiredTools: ["travel_booking"],
        approvalRequired: true,
        status: "needs_input",
      },
    });
  });

});
