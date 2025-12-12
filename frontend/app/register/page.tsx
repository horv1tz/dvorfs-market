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
    setLoading(true);
    try {
      const response = await authAPI.register({
        email: data.email,
        password: data.password,
      });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuth(user, accessToken, refreshToken);
        Cookies.set('accessToken', accessToken);
        Cookies.set('refreshToken', refreshToken);
        toast.success('Регистрация успешна');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Подтвердите пароль</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-primary-600 hover:underline">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
}

