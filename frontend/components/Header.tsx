'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';
import { cartAPI } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user } = useAuth();
  const { clearAuth } = useAuthStore();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      cartAPI.getCart().then((res) => {
        if (res.data.success) {
          setCartCount(res.data.data.items?.length || 0);
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearAuth();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Dvorfs Market
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/products" className="hover:text-primary-600">
              Товары
            </Link>
            <Link href="/categories" className="hover:text-primary-600">
              Категории
            </Link>

            {user ? (
              <>
                <Link href="/cart" className="relative hover:text-primary-600">
                  Корзина
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="hover:text-primary-600">
                  Профиль
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:text-primary-600">
                    Админ
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary-600">
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

