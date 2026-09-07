import { describe, expect, it, vi } from "vitest";

const { mockCreateWorkRepository } = vi.hoisted(() => ({
  mockCreateWorkRepository: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: "authenticated-user-123",
          },
        },
        error: null,
      })),
    },
  })),
}));

vi.mock("@/lib/work-repository", () => ({
  createWorkRepository: mockCreateWorkRepository,
}));

import { POST } from "./route";

describe("POST /api/work", () => {
  it("rejects malformed JSON with a 400 response", async () => {
    const request = new Request("http://localhost/api/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{not-valid-json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON request body.",
    });
  });

  it("rejects a request without title or goal", async () => {
    const request = new Request("http://localhost/api/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Research competitors",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title and goal are required.",
    });
  });

  it("rejects an unauthenticated request", async () => {
    const { createClient } = await import("@/lib/supabase/server");

    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: null,
        })),
      },
    } as never);

    const request = new Request("http://localhost/api/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Research competitors",
        goal: "Understand the competitive landscape",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
  });

  it("creates a Work from title and goal without accepting client user_id", async () => {
    const createdWork = {
      id: "work-123",
      title: "Research competitors",
      goal: "Understand the competitive landscape",
      status: "draft",
      priority: "normal",
      autonomy: "auto",
      authorization: "not_required",
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-07T00:00:00.000Z",
    };

    mockCreateWorkRepository.mockReturnValue({
      createWork: vi.fn(async () => createdWork),
    });

    const request = new Request("http://localhost/api/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Research competitors",
        goal: "Understand the competitive landscape",
        user_id: "attacker-controlled-user-id",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.work).toMatchObject({
      id: "work-123",
      title: "Research competitors",
      goal: "Understand the competitive landscape",
    });
    expect(data.work.user_id).toBeUndefined();

    expect(mockCreateWorkRepository).toHaveBeenCalledWith(
      expect.objectContaining({
        getAuthenticatedUserId: expect.any(Function),
      }),
    );

    const repositoryOptions = mockCreateWorkRepository.mock.calls[0][0];
    await expect(repositoryOptions.getAuthenticatedUserId()).resolves.toBe(
      "authenticated-user-123",
    );
  });
});
