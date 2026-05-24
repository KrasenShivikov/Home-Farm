import { NextRequest, NextResponse } from "next/server";
import { updateSession, decrypt } from "@/lib/session";

const publicRoutes = ["/", "/login", "/register"];
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

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
  const authenticatedHome = role === "admin" ? "/admin" : "/dashboard";

  if (hasSession && publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(authenticatedHome, request.url));
  }

  if (!isPublicRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const res = NextResponse.next();
  if (sessionValue) {
    res.headers.set("Set-Cookie", sessionValue);
  }
  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
