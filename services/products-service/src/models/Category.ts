import { db } from '../database/db';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS, CACHE_TTL } from '../utils/redis';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  parent_id?: string;
  image_url?: string;
}

export class CategoryModel {
  static async create(data: CreateCategoryData): Promise<Category> {
    const [category] = await db('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id || null,
        image_url: data.image_url || null,
      })
      .returning('*');

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.categories);

    return category;
  }

  static async findAll(useCache = true): Promise<Category[]> {
    if (useCache) {
      const cached = await cacheGet(CACHE_KEYS.categories);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const categories = await db('categories')
      .orderBy('name', 'asc');

    if (useCache) {
      await cacheSet(CACHE_KEYS.categories, JSON.stringify(categories), CACHE_TTL.categories);
    }

    return categories;
  }

  static async findById(id: string): Promise<Category | undefined> {
    return db('categories').where({ id }).first();
  }

  static async findBySlug(slug: string): Promise<Category | undefined> {
    return db('categories').where({ slug }).first();
  }

  static async update(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const [category] = await db('categories')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.categories);
    await cacheDelete(CACHE_KEYS.category(id));

    return category;
  }

  static async delete(id: string): Promise<void> {
    await db('categories').where({ id }).delete();

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.categories);
    await cacheDelete(CACHE_KEYS.category(id));
  }
}

