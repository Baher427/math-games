'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Star, Trophy, Check } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

function TrueFalseGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '2');
  const { status } = useSession();

  const { trueFalseQuestion, currentGameScore, totalQuestions, hasAnswered, isCorrect, dispatch, player, isLoading } = useGameStore();
  const { playCorrect, playWrong } = useSound();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // تهيئة اللعبة - فقط إذا كان مسجل الدخول
  useEffect(() => {
    if (status === 'authenticated' && player && !isLoading) {
      dispatch({ type: 'START_GAME', payload: { gameType: 'true-false', tableNumber } });
    }
  }, [tableNumber, dispatch, status, player, isLoading]);

  // تشغيل الصوت
  useEffect(() => {
    if (hasAnswered && player) {
      if (isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  }, [hasAnswered, isCorrect, playCorrect, playWrong, player]);

  // الانتقال التلقائي
  useEffect(() => {
    if (hasAnswered && player) {
      const timer = setTimeout(() => {
        dispatch({ type: 'NEXT_QUESTION' });
      }, isCorrect ? 1500 : 2500);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, isCorrect, dispatch, player]);

  // إذا كانت الـ session في حالة تحميل أو الـ player
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // إذا لم يكن مسجل الدخول
  if (status === 'unauthenticated' || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAnswer = (answer: boolean) => {
    if (!hasAnswered) {
      dispatch({ type: 'ANSWER_TRUE_FALSE', payload: answer });
    }
  };

  if (!trueFalseQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-white/50 rounded-full hover:bg-white/80 transition-colors active:scale-95">
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
          <button onClick={() => router.push('/results')} className="px-4 py-2 text-white bg-gradient-to-r from-red-400 to-pink-500 rounded-full font-medium shadow-lg active:scale-95">
            إنهاء اللعب
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <Star className="w-6 h-6 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{currentGameScore}</span>
            <span className="text-amber-600/70">نقطة</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <Trophy className="w-6 h-6 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{totalQuestions}</span>
            <span className="text-purple-600/70">سؤال</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          <div className="text-center">
            <div className="mb-4 px-4 py-1 bg-purple-100 rounded-full text-purple-600 font-medium inline-block">
              جدول {tableNumber}
            </div>
            <div className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
              {trueFalseQuestion.num1} × {trueFalseQuestion.num2} = {trueFalseQuestion.displayedAnswer}
            </div>
            <p className="text-xl text-gray-500">هل هذه المعادلة صحيحة؟</p>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => handleAnswer(true)}
            disabled={hasAnswered}
            className={`w-32 h-32 rounded-3xl text-5xl font-bold transition-all shadow-lg active:scale-90 ${
              hasAnswered && trueFalseQuestion.isCorrect
                ? 'bg-green-500 text-white ring-4 ring-green-300'
                : hasAnswered && !trueFalseQuestion.isCorrect
                ? 'bg-red-100 text-red-300'
                : 'bg-white hover:bg-green-50 text-green-500 hover:ring-4 hover:ring-green-200'
            }`}
          >
            ✓
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={hasAnswered}
            className={`w-32 h-32 rounded-3xl text-5xl font-bold transition-all shadow-lg active:scale-90 ${
              hasAnswered && !trueFalseQuestion.isCorrect
                ? 'bg-red-500 text-white ring-4 ring-red-300'
                : hasAnswered && trueFalseQuestion.isCorrect
                ? 'bg-green-100 text-green-300'
                : 'bg-white hover:bg-red-50 text-red-500 hover:ring-4 hover:ring-red-200'
            }`}
          >
            ✗
          </button>
        </div>

        {hasAnswered && (
          <div className="mt-8 text-center">
            {isCorrect ? (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">🎉</div>
                <span className="text-2xl font-bold text-green-600">أحسنت! +1 نقطة</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">😔</div>
                <div className="text-2xl font-bold text-gray-700">
                  الإجابة الصحيحة: <span className="text-green-600 mx-2">{trueFalseQuestion.isCorrect ? 'صح' : 'خطأ'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrueFalseGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrueFalseGameContent />
    </Suspense>
  );
}
