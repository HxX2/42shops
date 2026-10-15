import { Hero } from "@/components/hero";
import { getSession } from "@/lib/session";
import { safeNext } from "@/lib/session-core";

const ERRORS: Record<string, string> = {
  config: "Sign-in isn't set up yet. Add FT_CLIENT_ID and FT_CLIENT_SECRET to the environment variables.",
  state: "The sign-in took too long or was opened in another tab. Start it again.",
  denied: "You cancelled the 42 sign-in. Start it again whenever you're ready.",
  oauth: "42 refused the sign-in. Check that your 42 app's redirect URI matches this site, then try again.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);

  const session = await getSession();
  const error = pick("error");
  const notice = error
    ? { tone: "error" as const, text: ERRORS[error] ?? "Something went wrong while signing in. Try again." }
    : pick("auth") === "required" && !session
      ? { tone: "info" as const, text: "Sign in with your 42 account to browse the shops." }
      : null;

  return (
    <Hero
      user={session ? { login: session.login, image: session.image } : null}
      next={safeNext(pick("next"))}
      notice={notice}
    />
  );
}
