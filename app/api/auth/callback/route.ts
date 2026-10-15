import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
  safeNext,
  signSession,
  type SessionUser,
} from "@/lib/session-core";
import { resolveUserImage } from "@/lib/utils";

type Me = {
  id: number;
  login: string;
  displayname?: string | null;
  usual_full_name?: string | null;
  wallet?: number | null;
  image?: { link?: string | null; versions?: { small?: string | null; medium?: string | null } } | null;
  campus?: Array<{ id: number }>;
  campus_users?: Array<{ campus_id: number; is_primary: boolean }>;
};

function sameString(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function GET(request: NextRequest) {
  const origin = env.appUrl ?? request.nextUrl.origin;
  const params = request.nextUrl.searchParams;

  const clearState = (res: NextResponse) => {
    res.cookies.set(STATE_COOKIE, "", { path: "/api/auth", maxAge: 0 });
    return res;
  };
  const fail = (reason: string) =>
    clearState(NextResponse.redirect(new URL(`/?error=${reason}`, origin)));

  if (params.get("error")) return fail("denied");

  const code = params.get("code");
  const state = params.get("state");
  const stored = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !stored) return fail("state");

  const [expected, encodedNext] = stored.split("|");
  if (!expected || !sameString(expected, state)) return fail("state");
  const next = safeNext(encodedNext ? decodeURIComponent(encodedNext) : null);

  try {
    const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.clientId,
        client_secret: env.clientSecret,
        code,
        redirect_uri: `${origin}/api/auth/callback`,
        state,
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const meRes = await fetch("https://api.intra.42.fr/v2/me", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });
    if (!meRes.ok) throw new Error(`/v2/me failed (${meRes.status})`);
    const me = (await meRes.json()) as Me;

    // The user's 42 token is used once here and discarded; only this profile is kept.
    const user: SessionUser = {
      id: me.id,
      login: me.login,
      displayName: me.usual_full_name || me.displayname || me.login,
      image: resolveUserImage(me.image?.versions?.small ?? me.image?.link ?? null),
      wallet: me.wallet ?? 0,
      campusId:
        me.campus_users?.find((c) => c.is_primary)?.campus_id ?? me.campus?.[0]?.id ?? null,
    };

    const response = NextResponse.redirect(new URL(next, origin));
    response.cookies.set(SESSION_COOKIE, await signSession(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return clearState(response);
  } catch (error) {
    console.error("[auth] 42 OAuth callback failed:", error);
    return fail("oauth");
  }
}
