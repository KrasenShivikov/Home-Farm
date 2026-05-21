import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/session";

const publicRoutes = ["/", "/login", "/register"];

export async function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Extend cookie expiration
  const sessionResponse = await updateSession(request);
  const sessionValue = sessionResponse?.headers.get("Set-Cookie");
  const hasSession = request.cookies.has("session") || !!sessionValue;

  if (!isPublicRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const res = NextResponse.next();
  if (sessionValue) {
    res.headers.set("Set-Cookie", sessionValue);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};