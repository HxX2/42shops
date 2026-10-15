import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { STATE_COOKIE, safeNext } from "@/lib/session-core";

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("base64url");
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const origin = env.appUrl ?? request.nextUrl.origin;

  let clientId: string;
  try {
    clientId = env.clientId;
  } catch {
    return NextResponse.redirect(new URL("/?error=config", origin));
  }

  const state = randomState();
  const authorize = new URL("https://api.intra.42.fr/oauth/authorize");
  authorize.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/callback`,
    response_type: "code",
    scope: "public",
    state,
  }).toString();

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, `${state}|${encodeURIComponent(next)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 60 * 10,
  });
  return response;
}
