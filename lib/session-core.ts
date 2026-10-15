// Shared by proxy.ts and server code. No Next.js runtime imports here.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "cs_session";
export const STATE_COOKIE = "cs_oauth";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: number;
  login: string;
  displayName: string;
  image: string | null;
  wallet: number;
  campusId: number | null;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const user = payload.user as SessionUser | undefined;
    return user && typeof user.id === "number" && typeof user.login === "string" ? user : null;
  } catch {
    return null;
  }
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(value: string | null | undefined, fallback = "/shops"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
