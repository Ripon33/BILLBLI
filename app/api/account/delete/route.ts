import { NextResponse } from "next/server";
import { deleteCurrentAccount } from "@/lib/auth/account-deletion";

export async function POST() {
  try {
    await deleteCurrentAccount();

    return NextResponse.json({ success: true });
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

    console.error("Account deletion failed:", error);

    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 },
    );
  }
}
