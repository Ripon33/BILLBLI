import { describe, expect, it } from "vitest";
import {
  evaluateWorkAutonomy,
  type WorkAutonomy,
} from "./work-autonomy";

describe("work autonomy policy", () => {
  it("represents all four approved autonomy levels", () => {
    const levels: WorkAutonomy[] = [
      "auto",
      "review",
      "approval",
      "restricted",
    ];

    expect(levels).toHaveLength(4);
  });

  it("allows auto work without authorization", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "auto",
        authorized: false,
      }),
    ).toEqual({
      allowed: true,
      requiresReview: false,
      requiresAuthorization: false,
    });
  });

  it("requires review for review-level work", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "review",
        authorized: false,
      }),
    ).toEqual({
      allowed: false,
      requiresReview: true,
      requiresAuthorization: false,
    });
  });

  it("requires authorization for approval-level work", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "approval",
        authorized: false,
      }),
    ).toEqual({
      allowed: false,
      requiresReview: false,
      requiresAuthorization: true,
    });
  });

  it("allows approval-level work after authorization", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "approval",
        authorized: true,
      }),
    ).toEqual({
      allowed: true,
      requiresReview: false,
      requiresAuthorization: false,
    });
  });

  it("requires authorization for restricted work", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "restricted",
        authorized: false,
      }),
    ).toEqual({
      allowed: false,
      requiresReview: false,
      requiresAuthorization: true,
    });
  });

  it("does not execute external actions", () => {
    expect(
      evaluateWorkAutonomy({
        autonomy: "auto",
        authorized: false,
      }),
    ).not.toHaveProperty("execute");
  });
});
