import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Campus view counts, stored in Upstash Redis so they are shared by every
 * serverless instance and survive deploys.
 *
 * Without Redis credentials (e.g. local dev) it falls back to in-memory
 * storage, which resets on restart and is per-process only.
 */

const COOLDOWN_SECONDS = 15 * 60; // one counted view per user per campus every 15 min
const COUNTS_KEY = "campus-views:counts"; // sorted set: member = campusId, score = views
const usersKey = (campusId: number) => `campus-views:users:${campusId}`; // set of userIds
const cooldownKey = (userId: number, campusId: number) => `campus-views:cooldown:${userId}:${campusId}`;

function createRedis(): Redis | null {
  // Supports both the Upstash and the Vercel KV / Marketplace variable names.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const redis = createRedis();

const memory = {
  counts: new Map<number, number>(),
  users: new Map<number, Set<number>>(),
  cooldowns: new Map<string, number>(),
};

function isValidId(n: number) {
  return Number.isInteger(n) && n > 0;
}

/** Record a qualified view by an authenticated user. Returns true if it was counted. */
export async function recordCampusView(campusId: number, userId: number): Promise<boolean> {
  if (!isValidId(campusId) || !isValidId(userId)) return false;

  if (redis) {
    try {
      // SET NX EX is atomic: only the first view inside the cooldown window gets "OK".
      const fresh = await redis.set(cooldownKey(userId, campusId), 1, { nx: true, ex: COOLDOWN_SECONDS });
      if (fresh !== "OK") return false;
      await redis
        .pipeline()
        .zincrby(COUNTS_KEY, 1, String(campusId))
        .sadd(usersKey(campusId), userId)
        .exec();
      return true;
    } catch (err) {
      console.error("[campus-views] Failed to record view:", err);
      return false;
    }
  }

  const key = `${userId}:${campusId}`;
  const now = Date.now();
  if (now - (memory.cooldowns.get(key) ?? 0) < COOLDOWN_SECONDS * 1000) return false;
  memory.cooldowns.set(key, now);
  memory.counts.set(campusId, (memory.counts.get(campusId) ?? 0) + 1);
  const users = memory.users.get(campusId) ?? new Set<number>();
  users.add(userId);
  memory.users.set(campusId, users);
  return true;
}

export type MostViewedResult = {
  campusId: number;
  views: number;
  uniqueUsers: number;
};

/** The globally most-viewed campus, excluding an optional campusId (e.g. the user's home campus). */
export async function getMostViewedCampusId(
  excludeCampusId?: number | null,
): Promise<MostViewedResult | null> {
  if (redis) {
    try {
      // Top two is enough: at most one of them can be the excluded campus.
      const top = await redis.zrange<(string | number)[]>(COUNTS_KEY, 0, 1, { rev: true, withScores: true });
      for (let i = 0; i + 1 < top.length; i += 2) {
        const campusId = Number(top[i]);
        const views = Number(top[i + 1]);
        if (campusId === excludeCampusId || !(views > 0)) continue;
        const uniqueUsers = await redis.scard(usersKey(campusId));
        return { campusId, views, uniqueUsers };
      }
      return null;
    } catch (err) {
      console.error("[campus-views] Failed to read most viewed:", err);
      return null;
    }
  }

  let best: MostViewedResult | null = null;
  for (const [campusId, views] of memory.counts) {
    if (campusId === excludeCampusId || views <= 0) continue;
    const uniqueUsers = memory.users.get(campusId)?.size ?? 0;
    if (!best || views > best.views || (views === best.views && uniqueUsers > best.uniqueUsers)) {
      best = { campusId, views, uniqueUsers };
    }
  }
  return best;
}
