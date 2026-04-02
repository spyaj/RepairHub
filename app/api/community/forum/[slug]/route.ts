import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { communitySlugSchema, communityThreadUpdateSchema } from "@/lib/server/validation/community";
import { deleteCommunityThread, updateCommunityThread } from "@/lib/server/community/service";

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
    return errorResponse(400, "VALIDATION_ERROR", "Invalid thread slug", requestId, parsedSlug.error.issues);
  }

  try {
    const parsed = communityThreadUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const result = await updateCommunityThread({ id: session.user.id, name: session.user.name }, parsedSlug.data, parsed.data);

    if (result.status === "not_found") {
      return errorResponse(404, "NOT_FOUND", "Thread not found", requestId);
    }

    if (result.status === "forbidden") {
      return errorResponse(403, "FORBIDDEN", "Only the creator can edit this thread", requestId);
    }

    log("info", "Community thread updated", {
      requestId,
      route: "/api/community/forum/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: result.thread, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community thread update failed", {
      requestId,
      route: "/api/community/forum/[slug]",
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
    return errorResponse(400, "VALIDATION_ERROR", "Invalid thread slug", requestId, parsedSlug.error.issues);
  }

  try {
    const result = await deleteCommunityThread({ id: session.user.id, name: session.user.name }, parsedSlug.data);

    if (result.status === "not_found") {
      return errorResponse(404, "NOT_FOUND", "Thread not found", requestId);
    }

    if (result.status === "forbidden") {
      return errorResponse(403, "FORBIDDEN", "Only the creator can delete this thread", requestId);
    }

    log("info", "Community thread deleted", {
      requestId,
      route: "/api/community/forum/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: { deleted: true }, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community thread delete failed", {
      requestId,
      route: "/api/community/forum/[slug]",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}