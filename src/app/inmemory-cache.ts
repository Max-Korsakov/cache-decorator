import { Observable } from 'rxjs';
import { publishReplay, refCount, take } from 'rxjs/operators';

export interface InMemoryCacheOptions {
  ttl?: number;
  cacheSize?: number;
}

export function InMemoryCache(params: InMemoryCacheOptions = {}) {
  let originalFunc: Function;
  const cacheSize = params.cacheSize || 1;

  let cache: {
    [key: string]: Promise<any> | Observable<any> | any;
  }[] = [];
  const timers = {};

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    originalFunc = descriptor.value;

    descriptor.value = function (...args) {
      const id = JSON.stringify(args);
      const currentCacheSize = Object.keys(cache).length;
      const data =
        cache.find((cachedItem) => cachedItem[id]) ||
        ({} as { [key: string]: Promise<any> | Observable<any> | any });
      /// Console for test purpouse ///
      if (!data[id]) {
        console.log('From origin');
      } else {
        console.log('From cash');
      }

      if (!data[id]) {
        data[id] = originalFunc.apply(this, args);

        if (data[id] instanceof Observable) {
          data[id] = data[id].pipe(publishReplay(1), refCount(), take(1));
        }
        if (currentCacheSize >= cacheSize) {
          if (timers[Object.keys(cache[0])[0]]) {
            clearTimeout(timers[Object.keys(cache[0])[0]]);
            delete timers[Object.keys(cache[0])[0]];
          }
          cache.shift();
        }
        cache.push(data);
      }

      if (params.ttl) {
        timers[id] = setTimeout(() => {
          cache = cache.filter((item) => Object.keys(item)[0] !== id);
          delete timers[id];
        }, params.ttl);
      }
      return data[id];
    };
  };
}
