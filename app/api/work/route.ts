import { NextResponse } from "next/server";
import { createWork } from "@/lib/work-engine";
import { createWorkRepository } from "@/lib/work-repository";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const requestBody =
      typeof body === "object" && body !== null
        ? body as Record<string, unknown>
        : {};

    const title =
      typeof requestBody.title === "string" ? requestBody.title.trim() : "";
    const goal =
      typeof requestBody.goal === "string" ? requestBody.goal.trim() : "";

    if (!title || !goal) {
      return NextResponse.json(
        { error: "Title and goal are required." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const repository = createWorkRepository({
      supabase,
      getAuthenticatedUserId: async () => user.id,
    });

    const work = createWork({
      title,
      goal,
    });

    const createdWork = await repository.createWork(work);

    return NextResponse.json(
      { work: createdWork },
      { status: 201 },
    );
  } catch (error) {
    console.error("Work creation failed:", error);

    return NextResponse.json(
      { error: "Failed to create Work." },
      { status: 500 },
    );
  }
}
