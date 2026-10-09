/**
 * Small localStorage cache for API responses.
 *
 * Never throws: storage may be full, disabled (private mode) or missing (SSR),
 * and none of that should stop the app from using freshly fetched data.
 * Expired entries are removed on every write, and when storage is full the
 * entries closest to expiry are evicted until the new one fits.
 */

const PREFIX = 'maver-sedra:cache:';
/** Entries written by earlier versions, which never expired */
const LEGACY = /^maver-sedra:(https?:|sefaria:)/;

interface Entry<T> {
  data: T;
  expires: number;
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readCache<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (entry.expires > Date.now()) return entry.data;
    store.removeItem(PREFIX + key);
  } catch {
    // Corrupt entry; treat as a miss
  }
  return null;
}

export function writeCache<T>(key: string, data: T, ttlMs: number): void {
  const store = storage();
  if (!store) return;

  const value = JSON.stringify({ data, expires: Date.now() + ttlMs } satisfies Entry<T>);
  const live = pruneAndList(store);

  for (;;) {
    try {
      store.setItem(PREFIX + key, value);
      return;
    } catch {
      // Most likely over quota: evict the entry closest to expiry and retry
      const victim = live.shift();
      if (!victim) return;
      store.removeItem(victim.key);
    }
  }
}

/**
 * Removes expired and legacy entries; returns the remaining cache entries
 * ordered by expiry (soonest first)
 */
function pruneAndList(store: Storage): { key: string; expires: number }[] {
  const now = Date.now();
  const live: { key: string; expires: number }[] = [];
  const doomed: string[] = [];

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key) continue;
    if (LEGACY.test(key)) {
      doomed.push(key);
    } else if (key.startsWith(PREFIX)) {
      let expires = 0;
      try {
        expires = (JSON.parse(store.getItem(key) ?? '') as Entry<unknown>).expires;
      } catch {
        // Unreadable entry; expires stays 0 so it gets removed
      }
      if (expires > now) live.push({ key, expires });
      else doomed.push(key);
    }
  }

  doomed.forEach((key) => store.removeItem(key));
  return live.sort((a, b) => a.expires - b.expires);
}
