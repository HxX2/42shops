import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

type CampusStat = {
  views: number;
  uniqueUserIds: number[];
  lastViewedAt: number;
};

type ViewStore = {
  campuses: Record<string, CampusStat>;
  userCooldowns: Record<string, number>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "campus-views.json");
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

let inMemoryStore: ViewStore | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

async function loadStore(): Promise<ViewStore> {
  if (inMemoryStore) return inMemoryStore;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ViewStore>;
    inMemoryStore = {
      campuses: parsed.campuses ?? {},
      userCooldowns: parsed.userCooldowns ?? {},
    };
  } catch {
    inMemoryStore = {
      campuses: {},
      userCooldowns: {},
    };
  }

  return inMemoryStore;
}

async function persistStore(): Promise<void> {
  if (!inMemoryStore) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Clean up cooldown entries older than 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [k, ts] of Object.entries(inMemoryStore.userCooldowns)) {
      if (ts < cutoff) delete inMemoryStore.userCooldowns[k];
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[campus-views] Failed to persist data:", err);
  }
}

function schedulePersist(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    void persistStore();
  }, 500);
}

/** Record a qualified view by an authenticated user */
export async function recordCampusView(campusId: number, userId: number): Promise<boolean> {
  if (!Number.isInteger(campusId) || campusId <= 0) return false;
  if (!Number.isInteger(userId) || userId <= 0) return false;

  const store = await loadStore();
  const now = Date.now();
  const cooldownKey = `${userId}_${campusId}`;
  const lastViewTime = store.userCooldowns[cooldownKey] || 0;

  // Anti-spam cooldown check (15 minutes)
  if (now - lastViewTime < COOLDOWN_MS) {
    return false;
  }

  // Update user cooldown
  store.userCooldowns[cooldownKey] = now;

  // Update campus stats
  const cKey = String(campusId);
  const current = store.campuses[cKey] ?? {
    views: 0,
    uniqueUserIds: [],
    lastViewedAt: 0,
  };

  current.views += 1;
  current.lastViewedAt = now;
  if (!current.uniqueUserIds.includes(userId)) {
    current.uniqueUserIds.push(userId);
  }

  store.campuses[cKey] = current;
  schedulePersist();
  return true;
}

export type MostViewedResult = {
  campusId: number;
  views: number;
  uniqueUsers: number;
};

/** Get the globally most-viewed campus, excluding an optional campusId (e.g. user's home campus) */
export async function getMostViewedCampusId(
  excludeCampusId?: number | null,
): Promise<MostViewedResult | null> {
  const store = await loadStore();
  const entries = Object.entries(store.campuses)
    .map(([idStr, stat]) => ({
      campusId: Number(idStr),
      views: stat.views,
      uniqueUsers: stat.uniqueUserIds?.length ?? 0,
      lastViewedAt: stat.lastViewedAt ?? 0,
    }))
    .filter((e) => e.views > 0 && e.campusId !== excludeCampusId)
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      if (b.uniqueUsers !== a.uniqueUsers) return b.uniqueUsers - a.uniqueUsers;
      return b.lastViewedAt - a.lastViewedAt;
    });

  if (entries.length === 0) return null;
  return {
    campusId: entries[0].campusId,
    views: entries[0].views,
    uniqueUsers: entries[0].uniqueUsers,
  };
}
