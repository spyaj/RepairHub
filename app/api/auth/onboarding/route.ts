import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth/session";
import { isAllowedOnboardingRole, isValidRole } from "@/lib/server/auth/roles";
import { connectMongo } from "@/lib/server/db/mongo";
import { AuthUser } from "@/lib/server/db/models/user";
import { errorResponse } from "@/lib/server/http/errors";
import { log } from "@/lib/server/observability/logger";
import { getRequestId } from "@/lib/server/observability/request-id";
import { onboardingSchema } from "@/lib/server/validation/auth";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required", requestId);
  }

  try {
    const payload = await req.json();
    const parsed = onboardingSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    if (!isValidRole(parsed.data.role) || !isAllowedOnboardingRole(parsed.data.role)) {
      return errorResponse(403, "INVALID_ROLE", "Role is not allowed for onboarding", requestId);
    }

    await connectMongo();

    const user = await AuthUser.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
        role: parsed.data.role,
        onboardingCompleted: true,
          profile: {
            suburb: parsed.data.suburb,
            postcode: "0000",
            streetAddress: parsed.data.streetAddress,
            latitude: parsed.data.latitude,
            longitude: parsed.data.longitude,
          },
        },
      },
      { new: true },
    );

    if (!user) {
      return errorResponse(404, "USER_NOT_FOUND", "User not found", requestId);
    }

    if (parsed.data.role === "REPAIRER") {
      await AuthUser.findByIdAndUpdate(session.user.id, {
        $set: {
          "repairerProfile.verificationStatus": "NOT_SUBMITTED",
        },
      });
    }

    log("info", "Onboarding completed", {
      requestId,
      route: "/api/auth/onboarding",
      actorId: session.user.id,
      role: user.role,
      statusCode: 200,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json(
      {
        data: {
          id: user._id.toString(),
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        },
        requestId,
      },
      { status: 200, headers: { "x-request-id": requestId } },
    );
  } catch {
    log("error", "Onboarding failed unexpectedly", {
      requestId,
      route: "/api/auth/onboarding",
      actorId: session.user.id,
      statusCode: 500,
      latencyMs: Date.now() - started,
    });

    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong", requestId);
  }
}
