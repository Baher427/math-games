'use client';

import { useRouter } from 'next/navigation';
import { Star, Trophy, Target, RotateCcw, Home, Check, X } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';
import { useEffect } from 'react';

export default function ResultsPage() {
  const router = useRouter();
  const { currentGameScore, totalQuestions, answers, selectedGame, selectedTable, dispatch } = useGameStore();
  const { playWin } = useSound();

  useEffect(() => {
    if (currentGameScore > 0) {
      playWin();
    }
  }, [currentGameScore, playWin]);

  const correctCount = answers.filter(a => a.isCorrect).length;
  const wrongCount = answers.length - correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleRestart = () => {
    if (selectedGame && selectedTable) {
      dispatch({ type: 'START_GAME', payload: { gameType: selectedGame, tableNumber: selectedTable } });
      router.push(`/game/${selectedGame}?table=${selectedTable}`);
    } else {
      router.push('/');
    }
  };

  const getEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🎉';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-md mx-auto">
        {/* النتيجة الرئيسية */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center mb-6">
          <div className="text-7xl mb-4">{getEmoji()}</div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">انتهت اللعبة!</h1>
          <p className="text-gray-500 mb-6">أحسنت! لقد أتممت اللعبة</p>

          {/* النقاط */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
              <Star className="w-8 h-8 mx-auto mb-1" />
              <div className="text-3xl font-bold">{currentGameScore}</div>
              <div className="text-sm opacity-80">نقطة</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 text-white">
              <Target className="w-8 h-8 mx-auto mb-1" />
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-sm opacity-80">نسبة</div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-gray-700">{totalQuestions}</div>
              <div className="text-xs text-gray-500">سؤال</div>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-green-500">صح</div>
            </div>
            <div className="bg-red-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
              <div className="text-xs text-red-500">خطأ</div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              العب مرة أخرى
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold active:scale-95"
            >
              <Home className="w-5 h-5" />
              الرئيسية
            </button>
          </div>
        </div>

        {/* تفاصيل الإجابات */}
        {answers.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              آخر الإجابات
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {answers.slice(-10).reverse().map((answer, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {answer.isCorrect ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">{answer.question}</span>
                  </div>
                  <span className={`font-bold ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.correctAnswer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
