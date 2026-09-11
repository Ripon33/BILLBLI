import { NextResponse } from "next/server";
import { updateCurrentProfile } from "@/lib/auth/profile-update";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const profile = await updateCurrentProfile({
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      ...(typeof body.avatarPath === "string"
        ? { avatarPath: body.avatarPath }
        : {}),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authenticated user is required"
    ) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Full name is required"
    ) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 },
      );
    }

    console.error("Profile update failed:", error);

    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
