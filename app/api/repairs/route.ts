import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { connectMongo } from "@/lib/server/db/mongo";
import { RepairJob } from "@/lib/server/db/models/repair-job";
import { errorResponse } from "@/lib/server/http/errors";
import { log } from "@/lib/server/observability/logger";
import { getRequestId } from "@/lib/server/observability/request-id";
import { repairJobCreateSchema } from "@/lib/server/validation/repairs";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  if (session.user.role !== "CLIENT") {
    return errorResponse(403, "FORBIDDEN_ROLE", "Only clients can create repair requests", requestId);
  }

  try {
    const parsed = repairJobCreateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    await connectMongo();

    const job = await RepairJob.create({
        clientId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        suburb: parsed.data.suburb,
        streetAddress: parsed.data.streetAddress,
        urgency: parsed.data.urgency,
        pickupOption: parsed.data.pickupOption,
        status: "PUBLISHED",
        imageUrls: parsed.data.imageUrls,
    });

    const responseData = {
      id: job._id.toString(),
      title: job.title,
      category: job.category,
      suburb: job.suburb,
      streetAddress: job.streetAddress,
      urgency: job.urgency,
      pickupOption: job.pickupOption,
      status: job.status,
      createdAt: job.createdAt,
    };

    log("info", "Repair request created", {
      requestId,
      route: "/api/repairs",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 201,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: responseData, requestId }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    log("error", "Repair request creation failed", {
      requestId,
      route: "/api/repairs",
      actorId: session.user.id,
      role: session.user.role,
      statusCode: 500,
      latencyMs: Date.now() - started,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : String(error),
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}
