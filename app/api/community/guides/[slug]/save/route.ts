import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { communitySlugSchema } from "@/lib/server/validation/community";
import { saveCommunityGuide } from "@/lib/server/community/service";

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
    return errorResponse(400, "VALIDATION_ERROR", "Invalid guide slug", requestId, parsedSlug.error.issues);
  }

  try {
    const result = await saveCommunityGuide(session.user.id, parsedSlug.data);

    if (!result || !result.guide) {
      return errorResponse(404, "NOT_FOUND", "Guide not found", requestId);
    }

    log("info", "Community guide saved", {
      requestId,
      route: "/api/community/guides/[slug]/save",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: result.guide, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community guide save failed", {
      requestId,
      route: "/api/community/guides/[slug]/save",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}