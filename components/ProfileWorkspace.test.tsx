import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileWorkspace, { createProfileViewModel } from "./ProfileWorkspace";
import { vi } from "vitest";

const { uploadProfilePhotoMock, getProfilePhotoUrlMock } = vi.hoisted(() => ({
  uploadProfilePhotoMock: vi.fn(),
  getProfilePhotoUrlMock: vi.fn(),
}));

vi.mock("@/lib/profile-photo-upload", () => ({
  uploadProfilePhoto: uploadProfilePhotoMock,
}));

vi.mock("@/lib/profile-photo-url", () => ({
  getProfilePhotoUrl: getProfilePhotoUrlMock,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

describe("ProfileWorkspace", () => {
  it("builds an authenticated profile view from user data", () => {
    expect(
      createProfileViewModel({
        id: "user-1",
        email: "user@example.com",
        user_metadata: {
          full_name: "Test User",
          avatar_path: "user-1/profile/photo-123.png",
        },
      }),
    ).toEqual({
      userId: "user-1",
      email: "user@example.com",
      fullName: "Test User",
      avatarPath: "user-1/profile/photo-123.png",
    });
  });

  it("falls back safely when full name is unavailable", () => {
    expect(
      createProfileViewModel({
        id: "user-2",
        email: "user@example.com",
        user_metadata: {},
      }),
    ).toEqual({
      userId: "user-2",
      email: "user@example.com",
      fullName: "BILLBLI User",
    });
  });
});

describe("profile avatar display", () => {
  it("displays the stored profile photo using a signed URL", async () => {
    getProfilePhotoUrlMock.mockResolvedValueOnce(
      "https://example.com/signed-avatar.png",
    );

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
            avatar_path: "user-1/profile/avatar-123.png",
          },
        }}
      />,
    );

    const avatar = await screen.findByAltText("Profile photo");

    expect(avatar).toHaveAttribute(
      "src",
      "https://example.com/signed-avatar.png",
    );
    expect(getProfilePhotoUrlMock).toHaveBeenCalledWith({
      supabase: {},
      avatarPath: "user-1/profile/avatar-123.png",
    });
  });
});

describe("profile editing", () => {
  it("normalizes a profile name before saving", async () => {
    const { normalizeProfileName } = await import("./ProfileWorkspace");

    expect(normalizeProfileName("  Updated User  ")).toBe("Updated User");
  });

  it("rejects an empty profile name", async () => {
    const { normalizeProfileName } = await import("./ProfileWorkspace");

    expect(() => normalizeProfileName("   ")).toThrow(
      "Full name is required",
    );
  });

  it("builds the profile update request", async () => {
    const { buildProfileUpdateRequest } = await import("./ProfileWorkspace");

    expect(buildProfileUpdateRequest("  Updated User ")).toEqual({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Updated User",
      }),
    });
  });

  it("includes an avatar path in the profile update request", async () => {
    const { buildProfileUpdateRequest } = await import("./ProfileWorkspace");

    expect(
      buildProfileUpdateRequest(
        "Updated User",
        "user-1/profile/avatar-123.png",
      ),
    ).toEqual({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Updated User",
        avatarPath: "user-1/profile/avatar-123.png",
      }),
    });
  });

  it("extracts the updated profile from the API response", async () => {
    const { readProfileUpdateResponse } = await import(
      "./ProfileWorkspace"
    );

    expect(
      readProfileUpdateResponse({
        profile: {
          id: "user-1",
          email: "user@example.com",
          fullName: "Updated User",
        },
      }),
    ).toEqual({
      id: "user-1",
      email: "user@example.com",
      fullName: "Updated User",
    });
  });
});

describe("profile photo editing", () => {
  it("shows a profile photo picker when editing", async () => {
    const user = userEvent.setup();

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));

    expect(
      screen.getByLabelText("Profile photo"),
    ).toBeInTheDocument();
  });
});

describe("profile photo preview", () => {
  it("previews a selected profile photo before saving", async () => {
    const user = userEvent.setup();

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));

    const photoInput = screen.getByLabelText("Profile photo");
    const file = new File(["profile-image"], "avatar.png", {
      type: "image/png",
    });

    await user.upload(photoInput, file);

    expect(screen.getByAltText("Profile preview")).toBeInTheDocument();
  });

  it("uploads a selected profile photo and sends its path when saving", async () => {
    const user = userEvent.setup();

    uploadProfilePhotoMock.mockReset();
    uploadProfilePhotoMock.mockResolvedValueOnce({
      path: "user-1/profile/avatar-123.png",
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        profile: {
          id: "user-1",
          email: "user@example.com",
          fullName: "Test User",
          avatarPath: "user-1/profile/avatar-123.png",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));

    const file = new File(["profile-image"], "avatar.png", {
      type: "image/png",
    });

    await user.upload(screen.getByLabelText("Profile photo"), file);
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(uploadProfilePhotoMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          fullName: "Test User",
          avatarPath: "user-1/profile/avatar-123.png",
        }),
      }),
    );
  });
});

describe("profile photo validation", () => {
  it("shows an error when an unsupported profile photo is selected", async () => {
    const user = userEvent.setup();

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));

    const photoInput = screen.getByLabelText("Profile photo");
    const file = new File(["not-an-image"], "document.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(photoInput, {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Profile photo type is not supported.",
    );
    expect(screen.queryByAltText("Profile preview")).not.toBeInTheDocument();
  });

  it("shows an error when a profile photo is too large", async () => {
    const user = userEvent.setup();

    render(
      <ProfileWorkspace
        user={{
          id: "user-1",
          email: "user@example.com",
          user_metadata: {
            full_name: "Test User",
          },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));

    const photoInput = screen.getByLabelText("Profile photo");
    const file = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "large-avatar.png",
      { type: "image/png" },
    );

    fireEvent.change(photoInput, {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Profile photo is too large.",
    );
    expect(screen.queryByAltText("Profile preview")).not.toBeInTheDocument();
  });
});
