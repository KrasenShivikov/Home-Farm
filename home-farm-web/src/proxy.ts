import { NextRequest, NextResponse } from "next/server";
import { updateSession, decrypt } from "@/lib/session";

const publicRoutes = ["/", "/login", "/register"];

function getAllowedCorsOrigins() {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request: NextRequest) {
  const requestOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedCorsOrigins();
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isAllowedOrigin =
    !origin ||
    origin === requestOrigin ||
    allowedOrigins.includes(origin) ||
    (isDevelopment && allowedOrigins.length === 0);

  if (!isAllowedOrigin) return null;

  return {
    "Access-Control-Allow-Origin": origin ?? requestOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function setNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    const corsHeaders = getCorsHeaders(request);

    if (!corsHeaders) {
      return new NextResponse(null, { status: 403 });
    }

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
    const response = NextResponse.redirect(new URL(authenticatedHome, request.url));
    setNoStoreHeaders(response);
    return response;
  }

  if (!isPublicRoute && !hasSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    setNoStoreHeaders(response);
    return response;
  }

  if (isAdminRoute && role !== "admin") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setNoStoreHeaders(response);
    return response;
  }

  const res = NextResponse.next();
  if (hasSession || !isPublicRoute) {
    setNoStoreHeaders(res);
  }
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
