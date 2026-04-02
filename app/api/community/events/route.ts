import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { createCommunityEvent, listCommunityEvents } from "@/lib/server/community/service";
import { communityEventCreateSchema } from "@/lib/server/validation/community";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();

  try {
    const events = await listCommunityEvents();

    log("info", "Community events loaded", {
      requestId,
      route: "/api/community/events",
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: { events }, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community events failed", {
      requestId,
      route: "/api/community/events",
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
    const parsed = communityEventCreateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const event = await createCommunityEvent(
      { id: session.user.id, name: session.user.name },
      parsed.data,
    );

    log("info", "Community event created", {
      requestId,
      route: "/api/community/events",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 201,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: event, requestId }, { status: 201, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community event creation failed", {
      requestId,
      route: "/api/community/events",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}