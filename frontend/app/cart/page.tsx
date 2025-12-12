'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: string[];
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await cartAPI.updateItem(itemId, quantity);
      await loadCart();
      toast.success('Корзина обновлена');
    } catch (error) {
      toast.error('Ошибка обновления корзины');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartAPI.removeItem(itemId);
      await loadCart();
      toast.success('Товар удален из корзины');
    } catch (error) {
      toast.error('Ошибка удаления товара');
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-8">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Корзина</h1>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Ваша корзина пуста</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700"
            >
              Перейти к товарам
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
              >
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">Нет фото</span>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.product?.name || 'Товар'}</h3>
                  <p className="text-gray-600">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Итого</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Товары:</span>
                  <span>{cart.items.length}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Всего:</span>
                  <span>{cart.total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

