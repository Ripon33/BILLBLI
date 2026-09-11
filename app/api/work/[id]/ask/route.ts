import { NextResponse } from "next/server";
import {
  buildAskWorkerRequest,
} from "@/lib/ask-worker";
import { validateChatAttachmentRequest } from "@/lib/chat-attachment-request";
import { orchestrateAskWorker } from "@/lib/ask-worker-orchestration";
import { createWorkRepository } from "@/lib/work-repository";

type AskWorkerRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: AskWorkerRouteContext,
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

  const worker = await repository.getWork(id);

  if (
    !worker ||
    (worker.workerType === undefined && worker.workerName === undefined)
  ) {
    return NextResponse.json(
      { error: "Worker not found." },
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
    !("message" in body) ||
    typeof body.message !== "string"
  ) {
    return NextResponse.json(
      { error: "Ask Worker message is required." },
      { status: 400 },
    );
  }

  try {
    const rawAttachments =
      "attachments" in body ? body.attachments : undefined;

    const attachments = validateChatAttachmentRequest({
      userId,
      attachments: rawAttachments as Parameters<
        typeof validateChatAttachmentRequest
      >[0]["attachments"],
    });

    const askRequest = buildAskWorkerRequest({
      workerId: worker.id,
      workerName: worker.workerName ?? worker.title,
      workerType: worker.workerType,
      workerGoal: worker.goal,
      message: body.message,
      attachments,
    });

    const result = await orchestrateAskWorker(askRequest);

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === "Ask Worker message is required." ||
        error.message === "Invalid chat attachments." ||
        error.message === "Invalid chat attachment storage path." ||
        error.message === "Invalid chat attachment metadata." ||
        error.message === "Chat attachments cannot be empty."
      )
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to process Ask Worker request." },
      { status: 500 },
    );
  }
}
