export interface Pool<T> {
  get: () => T;
  free: (t: T) => void;
}

const poolTag = Symbol();

export function free(t: any) {
  const pool: Pool<any> | undefined = t[poolTag];
  if (!pool) {
    return;
  }
  pool.free(t);
}

export function pool<T extends object>(init: () => T): Pool<T> {
  const cache: T[] = [];
  const tpool = {
    get: () => {
      if (cache.length === 0) {
        const got = init();
        (got as any)[poolTag] = tpool;
        return got;
      }
      return cache.pop()!;
    },
    free(t: T) {
      cache.push(t);
    },
  };
  return tpool;
}
