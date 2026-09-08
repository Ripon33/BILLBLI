import { NextResponse } from "next/server";
import {
  createWork,
  type WorkAutonomy,
} from "@/lib/work-engine";
import {
  WORKER_PROFILES,
  type WorkerType,
} from "@/lib/worker-domain";
import { createWorkRepository } from "@/lib/work-repository";
import { createClient } from "@/lib/supabase/server";

const AUTONOMY_LEVELS: WorkAutonomy[] = [
  "auto",
  "review",
  "approval",
  "restricted",
];

function isWorkerType(value: unknown): value is WorkerType {
  return (
    typeof value === "string" &&
    value in WORKER_PROFILES
  );
}

function isAutonomy(value: unknown): value is WorkAutonomy {
  return (
    typeof value === "string" &&
    AUTONOMY_LEVELS.includes(value as WorkAutonomy)
  );
}

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

    const workerType = requestBody.workerType;
    const workerName =
      typeof requestBody.workerName === "string"
        ? requestBody.workerName.trim()
        : "";
    const goal =
      typeof requestBody.goal === "string"
        ? requestBody.goal.trim()
        : "";

    const isWorkerCreation =
      workerType !== undefined || workerName !== "";

    if (isWorkerCreation) {
      if (!isWorkerType(workerType)) {
        return NextResponse.json(
          { error: "Invalid worker type." },
          { status: 400 },
        );
      }

      if (!workerName) {
        return NextResponse.json(
          { error: "Worker name is required." },
          { status: 400 },
        );
      }

      if (!goal) {
        return NextResponse.json(
          { error: "Goal is required." },
          { status: 400 },
        );
      }

      if (!isAutonomy(requestBody.autonomy)) {
        return NextResponse.json(
          { error: "Invalid autonomy level." },
          { status: 400 },
        );
      }
    }

    const title =
      typeof requestBody.title === "string"
        ? requestBody.title.trim()
        : "";

    if (!isWorkerCreation && (!title || !goal)) {
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

    const work = createWork(
      isWorkerCreation
        ? {
            title: workerName,
            goal,
            autonomy: requestBody.autonomy as WorkAutonomy,
            workerType,
            workerName,
            workerContext: {
              workerType,
              workerName,
            },
          }
        : {
            title,
            goal,
          },
    );

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
