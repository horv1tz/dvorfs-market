'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';
import { cartAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { user } = useAuth();
  const { clearAuth } = useAuthStore();
  const [cartCount, setCartCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

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
    <header className="backdrop-blur bg-slate-900/70 border-b border-slate-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-2xl font-bold text-primary-400 hover:text-primary-300 transition-colors"
          >
            Dvorfs Market
          </Link>

          <nav className="flex items-center gap-6 text-slate-200">
            <Link href="/products" className="hover:text-primary-300 transition-colors">
              Товары
            </Link>
            <Link href="/categories" className="hover:text-primary-300 transition-colors">
              Категории
            </Link>

            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg border border-slate-700 hover:border-primary-400 hover:text-primary-200 transition-all duration-200"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative hover:text-primary-300 transition-colors"
                >
                  Корзина
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="hover:text-primary-300 transition-colors">
                  Профиль
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:text-primary-300 transition-colors">
                    Админ
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-200 transition-colors"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary-300 transition-colors">
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-all duration-200 shadow-lg shadow-primary-500/30"
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

