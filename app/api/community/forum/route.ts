import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { createCommunityThread, listCommunityThreads } from "@/lib/server/community/service";
import { communityThreadCreateSchema } from "@/lib/server/validation/community";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();

  try {
    const threads = await listCommunityThreads();

    log("info", "Community forum loaded", {
      requestId,
      route: "/api/community/forum",
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: { threads }, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community forum failed", {
      requestId,
      route: "/api/community/forum",
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  try {
    const parsed = communityThreadCreateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const thread = await createCommunityThread(
      { id: session.user.id, name: session.user.name },
      parsed.data,
    );

    log("info", "Community thread created", {
      requestId,
      route: "/api/community/forum",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 201,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: thread, requestId }, { status: 201, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community thread creation failed", {
      requestId,
      route: "/api/community/forum",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}