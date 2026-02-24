'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { PlayerData } from '@/types/game';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  player: PlayerData | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  player: null
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAuth = true, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { player, dispatch } = useGameStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // تحميل بيانات اللاعب
  const loadPlayer = useCallback(async () => {
    try {
      const response = await fetch('/api/player');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_PLAYER', payload: data });
      }
    } catch (error) {
      console.error('Failed to load player:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === 'authenticated' && !player) {
      loadPlayer();
    }
  }, [status, player, loadPlayer]);

  // التحقق من التوجيه
  useEffect(() => {
    // لا تفعل شيء حتى يتم التحقق من الـ session
    if (status === 'loading') return;

    if (status === 'unauthenticated' && requireAuth) {
      // توجيه لتسجيل الدخول مع حفظ الصفحة الحالية
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (status === 'authenticated' && player) {
      // التحقق من صلاحيات الأدمن
      if (requireAdmin && !player.isAdmin) {
        router.push('/');
        return;
      }
      
      // استخدام setTimeout لتجنب خطأ setState المتزامن
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, player, requireAuth, requireAdmin, router, pathname]);

  // شاشة التحميل
  if (status === 'loading' || (requireAuth && !player) || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isLoading: false, 
      isAuthenticated: status === 'authenticated',
      player 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
