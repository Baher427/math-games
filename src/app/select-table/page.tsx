'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9];

function SelectTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get('game') || 'choices';

  const gameNames: Record<string, string> = {
    'choices': 'لعبة الاختيارات',
    'matching': 'لعبة التوصيل',
    'true-false': 'لعبة صح وخطأ'
  };

  const handleSelectTable = (table: number) => {
    router.push(`/game/${gameType}?table=${table}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* الشريط العلوي */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{gameNames[gameType]}</h1>
            <p className="text-gray-500">اختر جدول الضرب</p>
          </div>
        </div>

        {/* شبكة الجداول */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TABLES.map((table) => (
            <button
              key={table}
              onClick={() => handleSelectTable(table)}
              className="aspect-square rounded-3xl bg-white/80 backdrop-blur-md shadow-lg border border-white/60 flex flex-col items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
              <span className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {table}
              </span>
              <span className="text-sm text-gray-500 mt-2">جدول الضرب</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SelectTablePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SelectTableContent />
    </Suspense>
  );
}
