import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { communityEventUpdateSchema, communitySlugSchema } from "@/lib/server/validation/community";
import { deleteCommunityEvent, updateCommunityEvent } from "@/lib/server/community/service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
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
    const parsed = communityEventUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const result = await updateCommunityEvent({ id: session.user.id, name: session.user.name }, parsedSlug.data, parsed.data);

    if (result.status === "not_found") {
      return errorResponse(404, "NOT_FOUND", "Event not found", requestId);
    }

    if (result.status === "forbidden") {
      return errorResponse(403, "FORBIDDEN", "Only the creator can edit this event", requestId);
    }

    if (result.status === "capacity") {
      return errorResponse(409, "CAPACITY_CONFLICT", "Spots cannot be lower than current joined count", requestId);
    }

    log("info", "Community event updated", {
      requestId,
      route: "/api/community/events/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: result.event, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community event update failed", {
      requestId,
      route: "/api/community/events/[slug]",
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
    const result = await deleteCommunityEvent({ id: session.user.id, name: session.user.name }, parsedSlug.data);

    if (result.status === "not_found") {
      return errorResponse(404, "NOT_FOUND", "Event not found", requestId);
    }

    if (result.status === "forbidden") {
      return errorResponse(403, "FORBIDDEN", "Only the creator can delete this event", requestId);
    }

    log("info", "Community event deleted", {
      requestId,
      route: "/api/community/events/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: { deleted: true }, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community event delete failed", {
      requestId,
      route: "/api/community/events/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}