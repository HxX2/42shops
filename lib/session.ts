import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type SessionUser } from "./session-core";

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
});

/** Defense in depth: proxy.ts already guards /shops, pages check again. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/?auth=required");
  return session;
}
