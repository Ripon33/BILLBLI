import { describe, expect, it } from "vitest";
import {
  WORKER_PROFILES,
  type WorkerType,
} from "./worker-domain";

describe("Persistent AI Worker domain", () => {
  it("defines all supported worker types", () => {
    const workerTypes: WorkerType[] = [
      "hr_assistant",
      "accountant",
      "digital_marketer",
      "sales_assistant",
      "operations_manager",
      "customer_support",
      "research_analyst",
      "custom",
    ];

    for (const type of workerTypes) {
      expect(WORKER_PROFILES[type]).toBeDefined();
      expect(WORKER_PROFILES[type].type).toBe(type);
      expect(WORKER_PROFILES[type].displayName.length).toBeGreaterThan(0);
      expect(WORKER_PROFILES[type].description.length).toBeGreaterThan(0);
      expect(WORKER_PROFILES[type].defaultInstructions.length).toBeGreaterThan(
        0,
      );
      expect(WORKER_PROFILES[type].capabilities.length).toBeGreaterThan(0);
    }
  });

  it("keeps capability separate from authorization", () => {
    const profile = WORKER_PROFILES.digital_marketer;

    expect(profile.capabilities).toContain("marketing_research");
    expect("authorization" in profile).toBe(false);
  });
});
