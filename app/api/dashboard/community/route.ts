import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { getCommunityDashboard } from "@/lib/server/community/service";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  try {
    const dashboard = await getCommunityDashboard(session.user.id);

    if (!dashboard) {
      return errorResponse(404, "NOT_FOUND", "User not found", requestId);
    }

    log("info", "Community dashboard loaded", {
      requestId,
      route: "/api/dashboard/community",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: dashboard, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community dashboard failed", {
      requestId,
      route: "/api/dashboard/community",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}