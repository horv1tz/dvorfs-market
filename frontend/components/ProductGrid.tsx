'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getPopularProducts(8)
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-300">Загрузка...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="bg-slate-900/70 border border-slate-800 rounded-xl shadow-lg overflow-hidden hover:-translate-y-1 hover:shadow-primary/20 transition-all duration-200"
        >
          <div className="aspect-square bg-slate-800 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
            ) : (
              <span className="text-slate-500">Нет изображения</span>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg text-slate-100">{product.name}</h3>
            <p className="text-primary-300 font-bold text-xl">
              {product.price.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-slate-500 text-sm">Подробнее →</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

