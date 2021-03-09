import { Observable } from 'rxjs';
import { publishReplay, refCount, take } from 'rxjs/operators';

export interface InMemoryCacheOptions {
  ttl?: number;
  cacheSize?: number;
  sync?: boolean;
}

type CachedData = Promise<any> | Observable<any> | any;

export function InMemoryCache(params: InMemoryCacheOptions = {}) {
  let originalFunc: Function;
  const cacheSize = params.cacheSize || 1;
  const chacheTTL = params.ttl;
  const cacheMap = new Map<string, CachedData>();
  const timersMap = new Map<string, ReturnType<typeof setTimeout>>();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    originalFunc = descriptor.value;

    descriptor.value = function (...args) {
      if (!args.length && cacheSize > 1) {
        throw new Error(
          `If you don't provide arguments, cache size could not be bigger then 1`
        );
      }
      const id = JSON.stringify(args);
      const currentCacheSize = cacheMap.size;
      let data = cacheMap.get(id);
      if (!data) {
        data = originalFunc.apply(this, args);

        if (data instanceof Observable) {
          data = data.pipe(publishReplay(1), refCount(), take(1));
        }
        if (currentCacheSize >= cacheSize) {
          if (timersMap.has(cacheMap.keys()[0])) {
            clearTimeout(timersMap.get(cacheMap.keys()[0]));
            timersMap.delete(cacheMap.keys()[0]);
          }
          cacheMap.delete(cacheMap.keys()[0]);
        }
        if (params.sync) {
          cacheMap.set(id, data);
        } else {
          Promise.resolve().then(() => {
            cacheMap.set(id, data);
          });
        }
        if (chacheTTL || chacheTTL === 0) {
          const timerId = setTimeout(() => {
            cacheMap.delete(id);
            timersMap.delete(id);
          }, chacheTTL);
          timersMap.set(id, timerId);
        }
      }
      return data;
    };
  };
}
