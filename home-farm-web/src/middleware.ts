import { NextRequest, NextResponse } from "next/server";
import { updateSession, decrypt } from "@/lib/session";

const publicRoutes = ["/", "/login", "/register"];

export async function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Extend cookie expiration
  const sessionResponse = await updateSession(request);
  const sessionValue = sessionResponse?.headers.get("Set-Cookie");
  const currentCookie = request.cookies.get("session")?.value;
  const hasSession = !!currentCookie || !!sessionValue;

  let role = "user";
  if (hasSession) {
    const payload = await decrypt(currentCookie || "");
    if (payload) role = payload.role;
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!isPublicRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
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