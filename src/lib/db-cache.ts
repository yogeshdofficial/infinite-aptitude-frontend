/**
 * db-cache.ts
 *
 * A zero-dependency, in-memory key-value cache for SQLite query results.
 *
 * Why two caching layers?
 *  - React Query cache:   holds results while the component tree is mounted.
 *    When all subscribers unmount and gcTime elapses, the entry is evicted.
 *  - This cache:          holds results for the entire app session (page reload
 *    clears it). It prevents re-hitting SQLite even after React Query evicts
 *    an entry and a query is re-mounted later.
 *
 * Since InfiniteAptitude's SQLite database is read-only (content never changes
 * at runtime), indefinite caching is always correct. Every unique query key
 * maps to exactly one result set for the lifetime of the page.
 */

const store = new Map<string, unknown>();

export const dbCache = {
  /**
   * Return the cached value for `key`, or call `fetcher`, store its result,
   * and return it. Subsequent calls with the same key are synchronously fast.
   */
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (store.has(key)) {
      return store.get(key) as T;
    }
    const value = await fetcher();
    store.set(key, value);
    return value;
  },

  /** Manual invalidation — useful for tests or future write support. */
  invalidate(prefix?: string) {
    if (!prefix) {
      store.clear();
      return;
    }
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  },

  /** How many entries are currently cached — useful for debugging. */
  size() {
    return store.size;
  },
};
