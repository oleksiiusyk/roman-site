const DEFAULT_TTL = 2 * 60 * 60 * 1000; // 2 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function invalidateCache(prefix: string): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`cache:${prefix}`));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
