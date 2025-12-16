'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (data) => {
    console.log('Form submitted:', data);
    setLoading(true);
    try {
      console.log('Sending request to API...');
      const response = await authAPI.register({
        email: data.email,
        password: data.password,
      });
      console.log('Response:', response.data);
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuth(user, accessToken, refreshToken);
        Cookies.set('accessToken', accessToken);
        Cookies.set('refreshToken', refreshToken);
        toast.success('Регистрация успешна');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="relative max-w-md w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/8 to-blue-600/10 blur-3xl" />
        <div className="relative p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-50">Регистрация</h1>
            <p className="text-slate-400 text-sm">Создайте аккаунт, чтобы продолжить</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Пароль</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Минимум 8 символов"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Подтвердите пароль</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Повторите пароль"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-2 font-semibold text-slate-900 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/30 disabled:opacity-60"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400">
            <Link href="/login" className="hover:text-cyan-300 transition">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

