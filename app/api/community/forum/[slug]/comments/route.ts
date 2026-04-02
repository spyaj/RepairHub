import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { commentOnThread } from "@/lib/server/community/service";
import { communitySlugSchema, communityThreadCommentSchema } from "@/lib/server/validation/community";

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
    return errorResponse(400, "VALIDATION_ERROR", "Invalid thread slug", requestId, parsedSlug.error.issues);
  }

  try {
    const parsed = communityThreadCommentSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const thread = await commentOnThread(
      { id: session.user.id, name: session.user.name },
      parsedSlug.data,
      parsed.data.body,
    );

    if (!thread) {
      return errorResponse(404, "NOT_FOUND", "Thread not found", requestId);
    }

    log("info", "Community thread commented", {
      requestId,
      route: "/api/community/forum/[slug]/comments",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 201,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: thread, requestId }, { status: 201, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community comment failed", {
      requestId,
      route: "/api/community/forum/[slug]/comments",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}