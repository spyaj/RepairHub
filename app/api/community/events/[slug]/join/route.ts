import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { joinCommunityEvent } from "@/lib/server/community/service";
import { communitySlugSchema } from "@/lib/server/validation/community";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const requestId = getRequestId(req);
  const started = Date.now();
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  const { slug } = await context.params;
  const parsedSlug = communitySlugSchema.safeParse(slug);

  if (!parsedSlug.success) {
    return errorResponse(400, "VALIDATION_ERROR", "Invalid event slug", requestId, parsedSlug.error.issues);
  }

  try {
    const result = await joinCommunityEvent(session.user.id, parsedSlug.data);

    if (!result) {
      return errorResponse(404, "NOT_FOUND", "Event not found", requestId);
    }

    if (result.full) {
      return errorResponse(409, "EVENT_FULL", "This event is fully booked", requestId);
    }

    if (result.alreadyJoined) {
      return errorResponse(409, "ALREADY_JOINED", "You already joined this event", requestId);
    }

    log("info", "Community event joined", {
      requestId,
      route: "/api/community/events/[slug]/join",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: result.event, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community event join failed", {
      requestId,
      route: "/api/community/events/[slug]/join",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const requestId = getRequestId(req);
  const started = Date.now();
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  const { slug } = await context.params;
  const parsedSlug = communitySlugSchema.safeParse(slug);

  if (!parsedSlug.success) {
    return errorResponse(400, "VALIDATION_ERROR", "Invalid event slug", requestId, parsedSlug.error.issues);
  }

  try {
    const result = await joinCommunityEvent(session.user.id, parsedSlug.data);

    if (!result) {
      return errorResponse(404, "NOT_FOUND", "Event not found", requestId);
    }

    if (!result.alreadyJoined) {
      return errorResponse(409, "NOT_JOINED", "You are not joined to this event", requestId);
    }

    const { CommunityEvent } = await import("@/lib/server/db/models/community-event");
    const updated = await CommunityEvent.findOneAndUpdate(
      { slug: parsedSlug.data },
      { $pull: { joinedBy: session.user.id } },
      { new: true },
    ).lean();

    if (!updated) {
      return errorResponse(404, "NOT_FOUND", "Event not found", requestId);
    }

    log("info", "Community event left", {
      requestId,
      route: "/api/community/events/[slug]/join",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: { left: true }, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community event leave failed", {
      requestId,
      route: "/api/community/events/[slug]/join",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}