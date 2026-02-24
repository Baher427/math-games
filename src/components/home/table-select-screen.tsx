'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/game-store';

// الجداول من 2 إلى 9
const tables = [2, 3, 4, 5, 6, 7, 8, 9];

// ألوان لكل جدول
const tableColors = [
  'from-orange-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-teal-500',
  'from-yellow-400 to-orange-500',
  'from-indigo-400 to-blue-500',
  'from-red-400 to-pink-500'
];

export function TableSelectScreen() {
  const dispatch = useGameStore((state) => state.dispatch);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-4">
        {/* زر العودة */}
        <div className="w-full max-w-4xl pt-4">
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-4 py-2 text-green-700 bg-white/50 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
        </div>

        {/* العنوان */}
        <div className="text-center my-8">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-2">
            اختر الجدول
          </h1>
          <p className="text-green-600/70 text-lg">
            اختر الجدول الذي تريد التدرب عليه
          </p>
        </div>

        {/* شبكة الجداول */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl w-full px-4">
          {tables.map((table, index) => (
            <button
              key={table}
              onClick={() => dispatch({ type: 'SELECT_TABLE', payload: table })}
              className="relative overflow-hidden aspect-square rounded-3xl shadow-lg hover:shadow-2xl transition-all active:scale-95 hover:scale-105"
            >
              {/* خلفية متدرجة */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tableColors[index]}`} />

              {/* المحتوى */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                <span className="text-5xl md:text-6xl font-bold">
                  {table}
                </span>
                <span className="text-white/80 text-sm mt-2">جدول</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-auto py-4 text-green-600/50 text-sm">
          تعلّم بمرح! 🌟
        </footer>
      </div>
    </div>
  );
}
