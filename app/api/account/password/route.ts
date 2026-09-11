import { NextResponse } from "next/server";
import { updatePassword } from "@/lib/auth/password-update";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    await updatePassword({
      password: typeof body.password === "string" ? body.password : "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Password is required" ||
        error.message === "Password must be at least 8 characters"
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 },
        );
      }
    }

    console.error("Password update failed:", error);

    return NextResponse.json(
      { error: "Failed to update password." },
      { status: 500 },
    );
  }
}
