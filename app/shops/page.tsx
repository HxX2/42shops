import type { Metadata } from "next";
import { CampusDirectory } from "@/components/campus-directory";
import { getCampuses } from "@/lib/ft-api";
import { requireSession } from "@/lib/session";
import { groupByCountry } from "@/lib/utils";
import { getMostViewedCampusId } from "@/lib/campus-views";

export const metadata: Metadata = { title: "Choose a campus" };

export default async function ShopsPage() {
  const session = await requireSession();
  const campuses = await getCampuses();
  const mostViewed = await getMostViewedCampusId(session.campusId);

  // If no views recorded yet, fallback to highest student count campus (excluding user's home)
  let mostViewedCampusId = mostViewed?.campusId ?? null;
  let mostViewedCount = mostViewed?.views ?? 0;

  if (!mostViewedCampusId) {
    const candidate = campuses
      .filter((c) => c.id !== session.campusId)
      .sort((a, b) => b.usersCount - a.usersCount)[0];
    if (candidate) {
      mostViewedCampusId = candidate.id;
      mostViewedCount = 0; // 0 indicates initial trending fallback
    }
  }

  return (
    <CampusDirectory
      groups={groupByCountry(campuses)}
      homeCampusId={session.campusId}
      mostViewedCampusId={mostViewedCampusId}
      mostViewedCount={mostViewedCount}
    />
  );
}

