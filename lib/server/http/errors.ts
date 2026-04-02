import { NextResponse } from "next/server";

export function errorResponse(status: number, code: string, message: string, requestId: string, details: unknown[] = []) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
        requestId,
      },
    },
    { status, headers: { "x-request-id": requestId } },
  );
}
