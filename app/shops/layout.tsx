import { AppHeader } from "@/components/app-header";
import { AuthorHoverCard } from "@/components/author-hover-card";
import { getWallet } from "@/lib/ft-api";
import { getRepoStars } from "@/lib/github";
import { requireSession } from "@/lib/session";
import { resolveUserImage } from "@/lib/utils";

export default async function ShopsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [wallet, stars] = await Promise.all([
    getWallet(session.id, session.wallet),
    getRepoStars(),
  ]);

  return (
    <div className="sheet flex min-h-[calc(100dvh-1rem)] flex-col sm:min-h-[calc(100dvh-2rem)]">
      <AppHeader
        user={{
          login: session.login,
          displayName: session.displayName,
          image: resolveUserImage(session.image),
        }}
        wallet={wallet}
        stars={stars}
      />
      <div className="flex-1">{children}</div>
      <footer className="flex flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <span>Shop data comes from the 42 API and refreshes periodically.</span>
        <span className="inline-flex items-center">
          Made by <AuthorHoverCard />, not by 42.
        </span>
      </footer>
    </div>
  );
}
