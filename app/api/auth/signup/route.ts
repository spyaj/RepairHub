import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db/mongo";
import { AuthUser } from "@/lib/server/db/models/user";
import { errorResponse } from "@/lib/server/http/errors";
import { log } from "@/lib/server/observability/logger";
import { getRequestId } from "@/lib/server/observability/request-id";
import { signupSchema } from "@/lib/server/validation/auth";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const started = Date.now();

  try {
    const payload = await req.json();
    const parsed = signupSchema.safeParse(payload);

    if (!parsed.success) {
      log("warn", "Signup validation failed", {
        requestId,
        route: "/api/auth/signup",
        statusCode: 400,
        latencyMs: Date.now() - started,
      });

      return errorResponse(400, "VALIDATION_ERROR", "Request validation failed", requestId, parsed.error.issues);
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    await connectMongo();

    const existing = await AuthUser.findOne({ email: normalizedEmail }).select("_id").lean();

    if (existing) {
      return errorResponse(409, "EMAIL_ALREADY_EXISTS", "Email already in use", requestId);
    }

    const hashedPassword = await hash(parsed.data.password, 12);

    const user = await AuthUser.create({
        fullName: parsed.data.fullName,
        email: normalizedEmail,
        phone: parsed.data.phone,
        hashedPassword,
        role: parsed.data.role,
        onboardingCompleted: true,
        profile: {
          suburb: parsed.data.suburb,
          postcode: "0000",
          streetAddress: parsed.data.streetAddress,
        },
        repairerProfile:
          parsed.data.role === "REPAIRER"
            ? {
                verificationStatus: "NOT_SUBMITTED",
              }
            : undefined,
    });

    const responseData = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    };

    log("info", "Signup succeeded", {
      requestId,
      route: "/api/auth/signup",
      actorId: responseData.id,
      role: responseData.role,
      statusCode: 201,
      latencyMs: Date.now() - started,
    });

    return NextResponse.json({ data: responseData, requestId }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return errorResponse(409, "EMAIL_ALREADY_EXISTS", "Email already in use", requestId);
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "ValidationError"
    ) {
      return errorResponse(422, "VALIDATION_ERROR", "Request validation failed", requestId);
    }

    log("error", "Signup failed unexpectedly", {
      requestId,
      route: "/api/auth/signup",
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
