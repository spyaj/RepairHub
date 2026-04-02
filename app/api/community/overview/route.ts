import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/server/http/errors";
import { getRequestId } from "@/lib/server/observability/request-id";
import { log } from "@/lib/server/observability/logger";
import { getCommunityOverview } from "@/lib/server/community/service";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();

  try {
    const overview = await getCommunityOverview();

    log("info", "Community overview loaded", {
      requestId,
      route: "/api/community/overview",
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: overview, requestId }, { status: 200, headers: { "x-request-id": requestId } });
  } catch {
    log("error", "Community overview failed", {
      requestId,
      route: "/api/community/overview",
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}