'use client';

import { useSession, signOut } from 'next-auth/react';
import { useGameStore } from '@/store/game-store';
import { HomeScreen } from '@/components/home/home-screen';
import { TableSelectScreen } from '@/components/home/table-select-screen';
import { ChoicesGame } from '@/components/game/choices-game';
import { MatchingGame } from '@/components/game/matching-game';
import { TrueFalseGame } from '@/components/game/true-false-game';
import { ResultsScreen } from '@/components/results/results-screen';
import { ProfileScreen } from '@/components/profile/profile-screen';
import { LoginPage } from '@/components/auth/login-page';
import { BannedPage } from '@/components/auth/banned-page';
import { AdminScreen } from '@/components/admin/admin-screen';
import { usePlayerSync } from '@/hooks/use-player-sync';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const currentScreen = useGameStore((state) => state.currentScreen);
  const selectedGame = useGameStore((state) => state.selectedGame);
  const dispatch = useGameStore((state) => state.dispatch);
  const player = useGameStore((state) => state.player);
  const isLoading = useGameStore((state) => state.isLoading);
  const [loadError, setLoadError] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  // تزامن بيانات اللاعب بين الأجهزة (كل 15 ثانية)
  usePlayerSync(15000);

  // إعادة تعيين الـ store عند تسجيل الخروج
  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch({ type: 'RESET_STORE' });
      // تأخير تحديث الـ state لتجنب cascading renders
      const timer = setTimeout(() => {
        setLoadError(false);
        setIsBanned(false);
        setBanReason(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  // التعامل مع زر الرجوع في المتصفح
  useEffect(() => {
    const handlePopState = () => {
      // الرجوع للصفحة السابقة
      dispatch({ type: 'GO_BACK' });
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dispatch]);

  // تحديث الـ URL عند تغيير الشاشة (بدون إضافة entry جديدة للـ history)
  useEffect(() => {
    // استبدال الـ URL الحالي بدون إضافة للـ history
    const screenPath = currentScreen === 'home' ? '/' : `/?screen=${currentScreen}`;
    window.history.replaceState({ screen: currentScreen }, '', screenPath);
  }, [currentScreen]);

  // فحص حالة الحظر
  const checkBlockedStatus = useCallback(async () => {
    if (!session?.user || isBanned) return;
    
    try {
      const res = await fetch('/api/auth/check-blocked');
      const data = await res.json();
      
      if (data.isBlocked) {
        setBanReason(data.blockedReason || 'تم حظر حسابك');
        setIsBanned(true);
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('Error checking blocked status:', error);
    }
  }, [session, isBanned]);

  // فحص دوري للحظر كل 10 ثواني
  useEffect(() => {
    if (!session?.user || isBanned) return;
    
    const interval = setInterval(checkBlockedStatus, 10000);
    const initialCheck = setTimeout(checkBlockedStatus, 100);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialCheck);
    };
  }, [session, isBanned, checkBlockedStatus]);

  // تحميل بيانات اللاعب عند تسجيل الدخول
  useEffect(() => {
    if (session?.user && !player && !loadError && !isBanned) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      fetch('/api/player', { signal: controller.signal })
        .then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Failed to load');
          return res.json();
        })
        .then(data => {
          if (data.isBlocked) {
            setBanReason(data.blockedReason || 'تم حظر حسابك');
            setIsBanned(true);
            return;
          }
          if (data.id) {
            dispatch({ type: 'SET_PLAYER', payload: data });
          } else {
            setLoadError(true);
          }
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Load error:', err);
          setLoadError(true);
        });
        
      return () => {
        clearTimeout(timeoutId);
        controller.abort();
      };
    }
  }, [session, player, dispatch, loadError, isBanned]);

  // عرض شاشة التحميل
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // عرض صفحة تسجيل الدخول إذا لم يكن مسجل
  if (!session) {
    return <LoginPage />;
  }

  // عرض صفحة الحظر للمستخدم المحظور
  if (isBanned) {
    return <BannedPage reason={banReason || undefined} />;
  }

  // عرض شاشة التحميل لبيانات اللاعب
  if (isLoading && !player && !loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 gap-4">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">جاري تحميل البيانات...</p>
      </div>
    );
  }

  // عرض خطأ
  if (loadError && !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 gap-4 p-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-700">حدث خطأ</h2>
        <p className="text-gray-500 text-center">لم نتمكن من تحميل البيانات</p>
        <button
          onClick={() => setLoadError(false)}
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg active:scale-95"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // تحديد اللعبة المناسبة
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'table-select':
        return <TableSelectScreen />;
      case 'game':
        if (selectedGame === 'choices') return <ChoicesGame />;
        if (selectedGame === 'matching') return <MatchingGame />;
        if (selectedGame === 'true-false') return <TrueFalseGame />;
        return null;
      case 'results':
        return <ResultsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div key={currentScreen} className="min-h-screen">
      {renderScreen()}
    </div>
  );
}
