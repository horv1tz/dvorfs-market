'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Товары</h2>
            <p className="text-gray-600">Управление товарами и категориями</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Заказы</h2>
            <p className="text-gray-600">Управление заказами и их статусами</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Пользователи</h2>
            <p className="text-gray-600">Управление пользователями</p>
          </Link>

          <Link
            href="/admin/statistics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Статистика</h2>
            <p className="text-gray-600">Аналитика и отчеты</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

