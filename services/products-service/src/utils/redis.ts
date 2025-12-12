import { getRedisClient, cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../../shared/utils/redis';

export { getRedisClient, cacheGet, cacheSet, cacheDelete, cacheDeletePattern };

// Специфичные для products service кеш ключи
export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  products: (params: string) => `products:${params}`,
  category: (id: string) => `category:${id}`,
  categories: 'categories:all',
  popularProducts: 'products:popular',
};

export const CACHE_TTL = {
  product: 3600, // 1 hour
  products: 1800, // 30 minutes
  category: 3600,
  categories: 7200, // 2 hours
  popularProducts: 1800,
};

