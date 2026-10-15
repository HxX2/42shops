import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop-view";
import { getCampusProducts, getCampuses, getWallet } from "@/lib/ft-api";
import { requireSession } from "@/lib/session";
import { countryCode } from "@/lib/countries";
import { groupByCountry } from "@/lib/utils";
import { recordCampusView } from "@/lib/campus-views";

type Props = { params: Promise<{ campusId: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).campusId);
  if (!id) return { title: "Campus not found" };
  try {
    const campus = (await getCampuses()).find((c) => c.id === id);
    return { title: campus ? `${campus.name} shop` : "Campus not found" };
  } catch {
    return { title: "Campus shop" };
  }
}

export default async function CampusShopPage({ params }: Props) {
  const id = parseId((await params).campusId);
  if (!id) notFound();

  const session = await requireSession();
  const campuses = await getCampuses();
  const campus = campuses.find((c) => c.id === id);
  if (!campus) notFound();

  // Record qualified view asynchronously without blocking the shop response
  void recordCampusView(id, session.id);

  const [products, wallet] = await Promise.all([getCampusProducts(id), getWallet(session.id, session.wallet)]);

  return (
    <ShopView
      key={campus.id}
      campus={campus}
      code={countryCode(campus.country)}
      groups={groupByCountry(campuses)}
      products={products}
      wallet={wallet}
      homeCampusId={session.campusId}
      now={Date.now()}
    />
  );
}
