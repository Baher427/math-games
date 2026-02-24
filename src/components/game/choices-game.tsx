'use client';

import { useEffect } from 'react';
import { ArrowRight, Star, Trophy, X, Check } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

export function ChoicesGame() {
  const { 
    choicesQuestion, 
    selectedTable, 
    currentGameScore, 
    totalQuestions,
    hasAnswered, 
    selectedAnswer, 
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
      const delay = isCorrect ? 1500 : 2500;
      
      const timer = setTimeout(() => {
        dispatch({ type: 'NEXT_QUESTION' });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, isCorrect, dispatch]);

  if (!choicesQuestion) return null;

  const handleAnswer = (answer: number) => {
    if (!hasAnswered) {
      dispatch({ type: 'ANSWER', payload: answer });
    }
  };

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50">
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

        {/* بطاقة السؤال */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {/* رقم الجدول */}
          <div className="mb-4 px-4 py-1 bg-purple-100 rounded-full text-purple-600 font-medium">
            جدول {selectedTable}
          </div>

          {/* السؤال */}
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {choicesQuestion.num1} × {choicesQuestion.num2}
              </div>
              <div className="mt-4 text-2xl text-gray-500">= ?</div>
            </div>
          </div>

          {/* الاختيارات */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            {choicesQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = hasAnswered && option === choicesQuestion.correctAnswer;
              const isWrongOption = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={`${option}-${index}`}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                  className={`
                    relative overflow-hidden aspect-square rounded-2xl text-3xl md:text-4xl font-bold
                    transition-all duration-300 shadow-lg active:scale-90
                    ${!hasAnswered ? 'cursor-pointer hover:shadow-xl hover:scale-105' : 'cursor-default'}
                    ${isCorrectOption
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                      : isWrongOption
                      ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                      : isSelected
                      ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                    }
                  `}
                >
                  {isCorrectOption && <Check className="w-12 h-12 text-white mx-auto" />}
                  {isWrongOption && <X className="w-12 h-12 text-white mx-auto" />}
                  {!isCorrectOption && !isWrongOption && option}
                </button>
              );
            })}
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
                  <div className="text-2xl font-bold text-gray-700">
                    الإجابة الصحيحة: 
                    <span className="text-green-600 mx-2">{choicesQuestion.correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-purple-600/50 text-sm">
          استمر في التدرب! 💪
        </footer>
      </div>
    </div>
  );
}
