'use client';

import { Home, RotateCcw, Trophy, Target, TrendingUp, Check, X } from 'lucide-react';
import { useGameStore } from '@/store/game-store';

export function ResultsScreen() {
  const { currentGameScore, totalQuestions, answers, selectedTable, selectedGame, dispatch } = useGameStore();

  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const wrongAnswers = answers.filter(a => !a.isCorrect).length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // تحديد الرسالة بناءً على النسبة
  const getMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'ممتاز! أنت بطل!', color: 'text-amber-500' };
    if (percentage >= 70) return { emoji: '🌟', text: 'رائع جداً!', color: 'text-green-500' };
    if (percentage >= 50) return { emoji: '👏', text: 'جيد! استمر!', color: 'text-blue-500' };
    return { emoji: '💪', text: 'حاول مرة أخرى!', color: 'text-purple-500' };
  };

  const message = getMessage();

  // اسم اللعبة
  const gameName = selectedGame === 'choices' 
    ? 'لعبة الاختيارات' 
    : selectedGame === 'matching' 
    ? 'لعبة التوصيل' 
    : 'لعبة صح وغلط';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* العنوان */}
        <div className="text-center mt-8 mb-6">
          <div className="text-8xl mb-4">{message.emoji}</div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${message.color}`}>
            {message.text}
          </h1>
          {selectedTable && (
            <p className="text-gray-500 text-lg">
              {gameName} - جدول {selectedTable}
            </p>
          )}
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-700">{currentGameScore}</div>
            <div className="text-sm text-gray-500">نقطة</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-700">{totalQuestions}</div>
            <div className="text-sm text-gray-500">سؤال</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-500">صحيحة</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-600">{wrongAnswers}</div>
            <div className="text-sm text-gray-500">خاطئة</div>
          </div>
        </div>

        {/* شريط النسبة المئوية */}
        <div className="max-w-2xl mx-auto w-full mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-gray-700">نسبة النجاح</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{percentage}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${percentage}%` }}
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 90
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    : percentage >= 70
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : percentage >= 50
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                    : 'bg-gradient-to-r from-purple-400 to-violet-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* سجل الإجابات */}
        {answers.length > 0 && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-700 mb-3 text-center">سجل الإجابات</h3>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-xl
                        ${answer.isCorrect
                          ? 'bg-green-100 border-2 border-green-300'
                          : 'bg-red-100 border-2 border-red-300'
                        }
                      `}
                    >
                      <span className="text-sm font-medium text-gray-600">{answer.question}</span>
                      <span className={`text-lg font-bold ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.userAnswer}
                      </span>
                      {!answer.isCorrect && (
                        <span className="text-xs text-green-600">= {answer.correctAnswer}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-auto pb-8">
          <button
            onClick={() => dispatch({ type: 'RESTART' })}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-lg"
          >
            <RotateCcw className="w-5 h-5" />
            العب مرة أخرى
          </button>

          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-lg border border-gray-200"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
