import { SignJWT, jwtVerify } from "jose";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET is not set in environment");

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: number, name: string, role: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, name, role, expires });

  (await cookies()).set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function logout() {
  (await cookies()).set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
  });
}

export async function getSession() {
  noStore();

  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) return null;

  const parsed = await decrypt(sessionCookie);
  if (!parsed) return null;

  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = new Response();
  res.headers.append(
    "Set-Cookie",
    `session=${await encrypt(parsed)}; Path=/; HttpOnly; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }; Expires=${parsed.expires.toUTCString()}`
  );

  return res;
}
