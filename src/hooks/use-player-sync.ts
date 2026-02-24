'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/game-store';
import { useSession } from 'next-auth/react';

// تحديث دوري لبيانات اللاعب للتزامن بين الأجهزة
export function usePlayerSync(intervalMs: number = 15000) {
  const { data: session, status } = useSession();
  const player = useGameStore((state) => state.player);
  const dispatch = useGameStore((state) => state.dispatch);
  const lastUpdateRef = useRef<number>(0);
  const isSyncingRef = useRef(false);

  const syncPlayerData = useCallback(async () => {
    // منع التزامن المتزامن
    if (isSyncingRef.current) return;
    
    // التحقق من تسجيل الدخول
    if (status !== 'authenticated' || !session?.user) return;
    
    // التحقق من وجود بيانات اللاعب
    if (!player?.id) return;
    
    // التحقق من عدم التحديث مؤخراً (debounce بسيط)
    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) return;
    
    isSyncingRef.current = true;
    
    try {
      const response = await fetch('/api/player');
      
      if (response.ok) {
        const data = await response.json();
        
        // التحقق من وجود تغييرات
        const hasChanges = 
          data.points !== player.points ||
          data.avatarId !== player.avatarId ||
          data.name !== player.name ||
          JSON.stringify(data.purchasedAvatars?.sort()) !== JSON.stringify(player.purchasedAvatars?.sort());
        
        if (hasChanges) {
          dispatch({ 
            type: 'UPDATE_PLAYER_DATA', 
            payload: {
              points: data.points,
              avatarId: data.avatarId,
              name: data.name,
              purchasedAvatars: data.purchasedAvatars
            }
          });
          lastUpdateRef.current = now;
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [session, status, player, dispatch]);

  // تحديث دوري
  useEffect(() => {
    if (status !== 'authenticated' || !player) return;
    
    // تحديث أولي بعد تأخير
    const initialSync = setTimeout(() => {
      syncPlayerData();
    }, 2000);
    
    // تحديث دوري
    const interval = setInterval(syncPlayerData, intervalMs);
    
    // تحديث عند focus على النافذة
    const handleFocus = () => {
      syncPlayerData();
    };
    window.addEventListener('focus', handleFocus);
    
    // تحديث عند visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPlayerData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, player, intervalMs, syncPlayerData]);

  return { syncPlayerData };
}
