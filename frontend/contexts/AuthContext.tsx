'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setAuth, clearAuth, setUser } = useAuthStore();
  const isLoading = false; // Can be enhanced with actual loading state

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      if (token && !user) {
        try {
          const response = await authAPI.me();
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        } catch (error) {
          clearAuth();
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
    };

    initAuth();
  }, [user, setUser, clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}



