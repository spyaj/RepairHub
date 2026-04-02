import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/dashboard", "/onboarding"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedPath = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export { middleware as proxy };

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};
