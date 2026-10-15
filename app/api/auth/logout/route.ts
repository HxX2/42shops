import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/session-core";

export async function POST(request: NextRequest) {
  const origin = env.appUrl ?? request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/", origin), 303);
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
