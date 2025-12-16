'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI } from '@/lib/api';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Профиль</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Информация</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Роль:</span> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h2 className="text-xl font-semibold mb-4">Навигация</h2>
              <nav className="space-y-2">
                <Link href="/profile/orders" className="block text-primary-600 hover:underline">
                  Мои заказы
                </Link>
                <Link href="/profile/wishlist" className="block text-primary-600 hover:underline">
                  Избранное
                </Link>
                <Link href="/profile/settings" className="block text-primary-600 hover:underline">
                  Настройки
                </Link>
              </nav>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Последние заказы</h2>
              {loading ? (
                <div className="text-center py-8">Загрузка...</div>
              ) : orders.length === 0 ? (
                <p className="text-gray-600">У вас пока нет заказов</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Заказ #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{order.total_amount.toLocaleString('ru-RU')} ₽</p>
                          <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


