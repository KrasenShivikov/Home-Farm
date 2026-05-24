import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

export async function getAuthUser(request: NextRequest) {
  // Check for Bearer token in Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await decrypt(token);
    if (payload) return payload;
  }

  // Fallback to session cookie for web clients
  const sessionCookie = request.cookies.get("session")?.value;
  if (sessionCookie) {
    return await decrypt(sessionCookie);
  }

  return null;
}
