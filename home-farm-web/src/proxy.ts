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

function isRouterCacheRequest(request: NextRequest) {
  return (
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.has("rsc") ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("next-router-segment-prefetch")
  );
}

function shouldRefreshSession(request: NextRequest) {
  const acceptsHtml = request.headers.get("accept")?.includes("text/html") ?? false;

  return request.method === "GET" && acceptsHtml && !isRouterCacheRequest(request);
}

function expireSessionCookie(response: NextResponse) {
  response.cookies.set("session", "", {
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
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
    setNoStoreHeaders(response);
    return response;
  }

  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  const currentCookie = request.cookies.get("session")?.value;
  const payload = currentCookie ? await decrypt(currentCookie) : null;
  const hasSession = !!payload;

  // Extend cookie expiration only for full document navigations. RSC/prefetch
  // requests can outlive logout and must not resurrect an expired session.
  const sessionResponse = hasSession && shouldRefreshSession(request) ? await updateSession(request) : null;
  const sessionValue = sessionResponse?.headers.get("Set-Cookie");
  const role = payload?.role ?? "user";

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const authenticatedHome = role === "admin" ? "/admin" : "/dashboard";

  if (hasSession && publicRoutes.includes(request.nextUrl.pathname)) {
    const response = NextResponse.redirect(new URL(authenticatedHome, request.url));
    setNoStoreHeaders(response);
    return response;
  }

  if (!isPublicRoute && !hasSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    setNoStoreHeaders(response);
    if (currentCookie) {
      expireSessionCookie(response);
    }
    return response;
  }

  if (isAdminRoute && role !== "admin") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setNoStoreHeaders(response);
    return response;
  }

  if (isDashboardRoute && role === "admin") {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    setNoStoreHeaders(response);
    return response;
  }

  const res = NextResponse.next();
  setNoStoreHeaders(res);
  if (sessionValue) {
    res.headers.set("Set-Cookie", sessionValue);
  }
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
