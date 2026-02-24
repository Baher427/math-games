'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGameStore } from '@/store/game-store';

const SESSION_TIMEOUT = 15 * 1000; // 15 ثانية

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasInGameRef = useRef(false);
  
  const { 
    selectedGame,
    selectedTable,
    dispatch 
  } = useGameStore();
  
  // التحقق مما إذا كان المستخدم في لعبة
  const isInGame = pathname?.includes('/game/') && selectedGame && selectedTable;
  
  // بدء عداد انتهاء الجلسة
  const startSessionTimeout = useCallback(() => {
    // إلغاء أي عداد سابق
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    console.log('[Session] بدء عداد انتهاء الجلسة - 15 ثانية');
    
    // بدء عداد جديد
    timeoutRef.current = setTimeout(() => {
      console.log('[Session] انتهت الجلسة - مسح البيانات');
      // انتهت الجلسة - مسح البيانات
      dispatch({ type: 'END_SESSION' });
    }, SESSION_TIMEOUT);
  }, [dispatch]);
  
  // إلغاء عداد انتهاء الجلسة
  const cancelSessionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      console.log('[Session] إلغاء عداد انتهاء الجلسة');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // مراقبة التغيرات في اللعبة
  useEffect(() => {
    // إذا دخل اللعبة
    if (isInGame) {
      wasInGameRef.current = true;
      // إلغاء أي عداد
      cancelSessionTimeout();
      console.log('[Session] في اللعبة - إلغاء العداد');
    }
    // إذا خرج من اللعبة وكان فيها
    else if (wasInGameRef.current && selectedGame && selectedTable) {
      console.log('[Session] خرج من اللعبة - بدء العداد');
      // بدء عداد انتهاء الجلسة
      startSessionTimeout();
    }
  }, [isInGame, selectedGame, selectedTable, cancelSessionTimeout, startSessionTimeout]);
  
  // تنظيف عند إلغاء الـ component
  useEffect(() => {
    return () => {
      cancelSessionTimeout();
    };
  }, [cancelSessionTimeout]);
  
  return null;
}
