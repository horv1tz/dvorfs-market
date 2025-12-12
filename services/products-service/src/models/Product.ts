import { db } from '../database/db';
import { ProductType } from '../../shared/types';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern, CACHE_KEYS, CACHE_TTL } from '../utils/redis';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  type: ProductType;
  category_id: string | null;
  images: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock?: number;
  type: ProductType;
  category_id?: string;
  images?: string[];
}

export interface UpdateProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  type?: ProductType;
  category_id?: string;
  images?: string[];
}

export interface ProductFilters {
  category_id?: string;
  type?: ProductType;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductModel {
  static async create(data: CreateProductData): Promise<Product> {
    const [product] = await db('products')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        stock: data.stock || 0,
        type: data.type,
        category_id: data.category_id || null,
        images: data.images || [],
      })
      .returning('*');

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.categories);
    await cacheDeletePattern('products:*');

    return product;
  }

  static async findById(id: string, useCache = true): Promise<Product | undefined> {
    const cacheKey = CACHE_KEYS.product(id);
    
    if (useCache) {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const product = await db('products').where({ id }).first();
    
    if (product && useCache) {
      await cacheSet(cacheKey, JSON.stringify(product), CACHE_TTL.product);
    }

    return product;
  }

  static async findBySlug(slug: string): Promise<Product | undefined> {
    return db('products').where({ slug }).first();
  }

  static async findMany(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = db('products');

    if (filters.category_id) {
      query = query.where({ category_id: filters.category_id });
    }

    if (filters.type) {
      query = query.where({ type: filters.type });
    }

    if (filters.min_price !== undefined) {
      query = query.where('price', '>=', filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.where('price', '<=', filters.max_price);
    }

    if (filters.search) {
      query = query.where((builder) => {
        builder
          .where('name', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    const total = await query.clone().count('* as count').first();
    const products = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset) as Product[];

    return {
      products,
      total: parseInt(total?.count as string) || 0,
    };
  }

  static async update(id: string, data: UpdateProductData): Promise<Product> {
    const [product] = await db('products')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.product(id));
    await cacheDeletePattern('products:*');

    return product;
  }

  static async delete(id: string): Promise<void> {
    await db('products').where({ id }).delete();

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.product(id));
    await cacheDeletePattern('products:*');
  }

  static async getPopular(limit: number = 10): Promise<Product[]> {
    const cacheKey = CACHE_KEYS.popularProducts;
    
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get products with most reviews (simplified - can be improved with actual order data)
    const products = await db('products')
      .leftJoin('reviews', 'products.id', 'reviews.product_id')
      .select('products.*')
      .count('reviews.id as review_count')
      .groupBy('products.id')
      .orderBy('review_count', 'desc')
      .orderBy('products.created_at', 'desc')
      .limit(limit) as unknown as Product[];

    await cacheSet(cacheKey, JSON.stringify(products), CACHE_TTL.popularProducts);

    return products;
  }
}

