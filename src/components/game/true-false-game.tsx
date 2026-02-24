'use client';

import { useEffect } from 'react';
import { ArrowRight, Star, Trophy, Check, X } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

export function TrueFalseGame() {
  const { 
    trueFalseQuestion, 
    selectedTable, 
    currentGameScore, 
    totalQuestions,
    hasAnswered,
    isCorrect,
    dispatch 
  } = useGameStore();
  
  const { playCorrect, playWrong } = useSound();

  // تشغيل الصوت عند الإجابة
  useEffect(() => {
    if (hasAnswered) {
      if (isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  }, [hasAnswered, isCorrect, playCorrect, playWrong]);

  // الانتقال التلقائي بعد الإجابة
  useEffect(() => {
    if (hasAnswered) {
      const timer = setTimeout(() => {
        dispatch({ type: 'GENERATE_QUESTION' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, dispatch]);

  if (!trueFalseQuestion) return null;

  const handleAnswer = (answer: boolean) => {
    if (!hasAnswered) {
      dispatch({ type: 'ANSWER_TRUE_FALSE', payload: answer });
    }
  };

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  const correctAnswer = trueFalseQuestion.num1 * trueFalseQuestion.num2;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-6">
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-white/50 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>

          <button
            onClick={handleEndGame}
            className="px-4 py-2 text-white bg-gradient-to-r from-red-400 to-pink-500 rounded-full font-medium shadow-lg active:scale-95"
          >
            إنهاء اللعب
          </button>
        </div>

        {/* بطاقة النقاط */}
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

        {/* منطقة اللعب */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {/* رقم الجدول */}
          <div className="mb-4 px-4 py-1 bg-purple-100 rounded-full text-purple-600 font-medium">
            جدول {selectedTable}
          </div>

          {/* السؤال */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                {trueFalseQuestion.num1} × {trueFalseQuestion.num2} = {trueFalseQuestion.displayedAnswer}
              </div>
              <div className="mt-6 text-2xl text-gray-500">
                هل هذه المعادلة صحيحة؟
              </div>
            </div>
          </div>

          {/* أزرار الصح والخطأ */}
          <div className="flex gap-6 w-full max-w-md">
            {/* زر صح */}
            <button
              onClick={() => handleAnswer(true)}
              disabled={hasAnswered}
              className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-90 ${
                hasAnswered
                  ? isCorrect && trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl'
                    : !isCorrect && !trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:shadow-xl'
              }`}
            >
              <Check className="w-12 h-12" />
              <span>صح</span>
            </button>

            {/* زر خطأ */}
            <button
              onClick={() => handleAnswer(false)}
              disabled={hasAnswered}
              className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-90 ${
                hasAnswered
                  ? isCorrect && !trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-xl'
                    : !isCorrect && trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-xl'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gradient-to-br from-red-400 to-pink-500 text-white hover:shadow-xl'
              }`}
            >
              <X className="w-12 h-12" />
              <span>خطأ</span>
            </button>
          </div>

          {/* رسالة النتيجة */}
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
                  <span className="text-xl text-gray-600 mb-2">
                    {trueFalseQuestion.isCorrect 
                      ? 'المعادلة كانت صحيحة!' 
                      : 'المعادلة كانت خاطئة!'
                    }
                  </span>
                  <span className="text-lg text-gray-500">
                    الإجابة الصحيحة: <span className="font-bold text-green-600">{correctAnswer}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-purple-600/50 text-sm">
          حدد إذا كانت المعادلة صحيحة أم خاطئة! ✅❌
        </footer>
      </div>
    </div>
  );
}
