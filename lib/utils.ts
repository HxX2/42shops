import type { Campus, CountryGroup, Product, ProductStatus } from "./types";
import { countryCode } from "./countries";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function productStatus(p: Product, now: number): ProductStatus {
  if (p.beginAt && Date.parse(p.beginAt) > now) return "upcoming";
  if (p.endAt && Date.parse(p.endAt) <= now) return "ended";
  if (p.quantity !== null && p.quantity <= 0) return "soldout";
  return "available";
}

const numberFormat = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => numberFormat.format(n);

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export function groupByCountry(campuses: Campus[]): CountryGroup[] {
  const map = new Map<string, Campus[]>();
  for (const c of campuses) {
    const list = map.get(c.country) ?? [];
    list.push(c);
    map.set(c.country, list);
  }
  return [...map.entries()]
    .map(([country, list]) => ({
      country,
      code: countryCode(country),
      campuses: list.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** City to show under a campus name, or null when it would just repeat the name. */
export function campusCity(c: { name: string; city: string }): string | null {
  if (!c.city) return null;
  const n = normalize(c.name).replace(/[^a-z]/g, "");
  const city = normalize(c.city).replace(/[^a-z]/g, "");
  return n === city || n.includes(city) ? null : c.city;
}

export function resolveUserImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes("cdn.intra.42.fr")) {
    try {
      const pathname = new URL(url).pathname;
      return `/api/images${pathname}`;
    } catch {
      // ignore
    }
  }
  if (url.startsWith("/users/")) {
    return `/api/images${url}`;
  }
  return url;
}

