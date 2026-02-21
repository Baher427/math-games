'use client';

import { useCallback, useRef } from 'react';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // إنشاء Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // تشغيل نغمة
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // تجاهل الأخطاء
    }
  }, [getAudioContext]);

  // صوت الصح - نغمة سعيدة (C major arpeggio)
  const playCorrect = useCallback(() => {
    const ctx = getAudioContext();
    
    // نغمة C
    playTone(523.25, 0.15, 'sine', 0.4); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.35), 80); // E5
    setTimeout(() => playTone(783.99, 0.25, 'sine', 0.3), 160); // G5
  }, [getAudioContext, playTone]);

  // صوت الخطأ - نغمة حادة منخفضة (buzzer)
  const playWrong = useCallback(() => {
    const ctx = getAudioContext();
    
    // نغمة حادة منخفضة
    playTone(150, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(100, 0.3, 'sawtooth', 0.25), 150);
  }, [getAudioContext, playTone]);

  // صوت التوصيل - نقرة خفيفة (pop)
  const playMatch = useCallback(() => {
    const ctx = getAudioContext();
    
    // نغمة عالية سريعة
    playTone(800, 0.08, 'sine', 0.25);
    playTone(1000, 0.05, 'sine', 0.2);
  }, [getAudioContext, playTone]);

  // صوت الفوز - موسيقى نصر
  const playWin = useCallback(() => {
    // C major scale up
    playTone(523.25, 0.12, 'sine', 0.35); // C5
    setTimeout(() => playTone(587.33, 0.12, 'sine', 0.35), 100); // D5
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.35), 200); // E5
    setTimeout(() => playTone(783.99, 0.12, 'sine', 0.35), 300); // G5
    setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.4), 400); // C6 - final
  }, [playTone]);

  return {
    playCorrect,
    playWrong,
    playMatch,
    playWin,
  };
}
