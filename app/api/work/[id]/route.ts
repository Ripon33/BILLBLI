import { NextResponse } from "next/server";
import { createWorkRepository } from "@/lib/work-repository";
import type { BillbliWork } from "@/lib/work-engine";

type WorkRouteContext = {
  params: Promise<{ id: string }>;
};

const autonomyLevels: BillbliWork["autonomy"][] = [
  "auto",
  "review",
  "approval",
  "restricted",
];

export async function PATCH(
  request: Request,
  { params }: WorkRouteContext,
) {
  const { id } = await params;
  const repository = createWorkRepository();

  const userId = await repository.getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const work = await repository.getWork(id);

  if (!work) {
    return NextResponse.json(
      { error: "Work not found." },
      { status: 404 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("autonomy" in body) ||
    typeof body.autonomy !== "string" ||
    !autonomyLevels.includes(body.autonomy as BillbliWork["autonomy"])
  ) {
    return NextResponse.json(
      { error: "Invalid autonomy level." },
      { status: 400 },
    );
  }

  try {
    const updated = await repository.updateWork(id, {
      autonomy: body.autonomy as BillbliWork["autonomy"],
    });

    return NextResponse.json({ work: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Work not found") {
      return NextResponse.json(
        { error: "Work not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Unable to update Work." },
      { status: 500 },
    );
  }
}
