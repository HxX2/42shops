import "server-only";
import { unstable_cache } from "next/cache";
import { env } from "./env";
import { FT_USER_AGENT, describeFtError } from "./ft-http";
import type { Campus, Product } from "./types";

const API = "https://api.intra.42.fr";
const CDN = "https://cdn.intra.42.fr";

export class FtApiError extends Error {
  constructor(public status: number, path: string, detail?: string) {
    super(`42 API responded ${status} for ${path}${detail ? ` (${detail})` : ""}`);
  }
}

// ---------------------------------------------------------------------------
// App token (client credentials). Lives only in server memory, never sent to
// the browser. The client secret is read from env at call time.
// ---------------------------------------------------------------------------
let appToken: { value: string; expiresAt: number } | null = null;
let appTokenPromise: Promise<string> | null = null;

async function getAppToken(): Promise<string> {
  if (appToken && appToken.expiresAt - 60_000 > Date.now()) return appToken.value;
  if (appTokenPromise) return appTokenPromise;

  appTokenPromise = (async () => {
    try {
      const res = await fetch(`${API}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": FT_USER_AGENT,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.clientId,
          client_secret: env.clientSecret,
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new FtApiError(res.status, "/oauth/token", await describeFtError(res));

      const data = (await res.json()) as { access_token: string; expires_in: number };
      appToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
      return appToken.value;
    } finally {
      appTokenPromise = null;
    }
  })();

  return appTokenPromise;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function apiGet<T>(path: string, attempt = 0): Promise<T> {
  const token = await getAppToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": FT_USER_AGENT },
    cache: "no-store",
  });

  // 42 allows ~2 requests/second per app; back off politely.
  if (res.status === 429 && attempt < 6) {
    const headerWait = Number(res.headers.get("retry-after"));
    const waitMs = (headerWait && !isNaN(headerWait) ? headerWait * 1000 : 1200) + attempt * 400;
    await sleep(waitMs);
    return apiGet<T>(path, attempt + 1);
  }
  if (res.status === 401 && attempt === 0) {
    appToken = null;
    return apiGet<T>(path, 1);
  }
  if (!res.ok) throw new FtApiError(res.status, path, await describeFtError(res));
  return (await res.json()) as T;
}

async function getAllPages<T>(path: string, maxPages = 20): Promise<T[]> {
  const out: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  for (let page = 1; page <= maxPages; page++) {
    const batch = await apiGet<T[]>(`${path}${sep}per_page=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) break;
    await sleep(550);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Normalizers: only whitelisted fields ever reach client components.
// ---------------------------------------------------------------------------
type RawCampus = {
  id: number;
  name: string;
  country?: string | null;
  city?: string | null;
  users_count?: number | null;
  time_zone?: string | null;
  website?: string | null;
  active?: boolean | null;
};

type RawProduct = {
  id: number;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  quantity?: number | null;
  begin_at?: string | null;
  end_at?: string | null;
  created_at?: string | null;
  slug?: string | null;
  image?: { url?: string | null } | null;
  is_uniq?: boolean | null;
  one_time_purchase?: boolean | null;
};

export async function fetchCdnImage(
  imagePath: string,
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  let clean = decodeURIComponent(imagePath.trim());
  if (clean.includes("cdn.intra.42.fr")) {
    try {
      clean = new URL(clean).pathname;
    } catch {
      // ignore
    }
  }
  clean = clean.replace(/^\/uploads/, "");
  if (!clean.startsWith("/")) clean = `/${clean}`;

  if (!clean.startsWith("/product/image/") && !clean.startsWith("/users/")) {
    return null;
  }

  try {
    const token = await getAppToken();
    const encodedPath = clean
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const url = `${CDN}${encodedPath}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": FT_USER_AGENT },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    return { buffer, contentType };
  } catch (err) {
    console.error("fetchCdnImage error:", err);
    return null;
  }
}

function resolveImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url) && !url.includes("cdn.intra.42.fr")) return url;

  let clean = url;
  if (clean.includes("cdn.intra.42.fr")) {
    try {
      clean = new URL(clean).pathname;
    } catch {
      // ignore
    }
  }
  clean = clean.replace(/^\/uploads/, "");
  if (!clean.startsWith("/")) clean = `/${clean}`;

  return `/api/images${clean}`;
}

function toCampus(c: RawCampus): Campus {
  return {
    id: c.id,
    name: c.name.trim(),
    country: c.country?.trim() || "Other",
    city: c.city?.trim() || "",
    usersCount: c.users_count ?? 0,
    timeZone: c.time_zone ?? null,
    website: c.website ?? null,
  };
}

function toProduct(p: RawProduct): Product {
  return {
    id: p.id,
    name: p.name?.trim() || `Item #${p.id}`,
    description: p.description?.trim() || "",
    price: p.price ?? 0,
    quantity: p.quantity ?? null,
    beginAt: p.begin_at ?? null,
    endAt: p.end_at ?? null,
    createdAt: p.created_at ?? null,
    slug: p.slug ?? null,
    image: resolveImage(p.image?.url),
    isUnique: Boolean(p.is_uniq),
    oneTimePurchase: Boolean(p.one_time_purchase),
  };
}

// ---------------------------------------------------------------------------
// Cached readers. Results are shared across all visitors, so the 42 API is
// hit at most once per window no matter how many people browse.
// ---------------------------------------------------------------------------
export const getCampuses = unstable_cache(
  async (): Promise<Campus[]> => {
    const raw = await getAllPages<RawCampus>("/v2/campus");
    return raw
      .filter((c) => c.active !== false)
      .map(toCampus)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  ["ft-campuses-v1"],
  { revalidate: 60 * 60 * 12, tags: ["campuses"] },
);

export function getCampusProducts(campusId: number): Promise<Product[]> {
  return unstable_cache(
    async () => {
      try {
        const raw = await getAllPages<RawProduct>(`/v2/campus/${campusId}/products`);
        return raw.map(toProduct);
      } catch (error) {
        if (error instanceof FtApiError && error.status === 404) return [];
        throw error;
      }
    },
    ["ft-products-v2", String(campusId)],
    { revalidate: 60 * 20, tags: [`products-${campusId}`] },
  )();
}

/** Fresh-ish wallet for the signed-in user; falls back to the value from sign-in. */
export async function getWallet(userId: number, fallback: number): Promise<number> {
  try {
    const wallet = await unstable_cache(
      async () => {
        const user = await apiGet<{ wallet?: number | null }>(`/v2/users/${userId}`);
        return typeof user.wallet === "number" ? user.wallet : null;
      },
      ["ft-wallet-v1", String(userId)],
      { revalidate: 120 },
    )();
    return wallet ?? fallback;
  } catch {
    return fallback;
  }
}
