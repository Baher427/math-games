'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Star, Check } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

function MatchingGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '2');
  
  const { matchingQuestion, matchingRound, currentGameScore, dispatch } = useGameStore();
  const { playMatch } = useSound();

  useEffect(() => {
    dispatch({ type: 'START_GAME', payload: { gameType: 'matching', tableNumber } });
  }, [tableNumber, dispatch]);

  useEffect(() => {
    if (matchingRound > 5) {
      router.push('/results');
    }
  }, [matchingRound, router]);

  const handleSelectQuestion = (question: string) => {
    dispatch({ type: 'SELECT_MATCHING_QUESTION', payload: question });
  };

  const handleSelectAnswer = (answer: number) => {
    dispatch({ type: 'SELECT_MATCHING_ANSWER', payload: answer });
    playMatch();
  };

  if (!matchingQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const shuffledAnswers = [...matchingQuestion.pairs]
    .map(p => p.answer)
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 px-4 py-2 text-emerald-700 bg-white/50 rounded-full hover:bg-white/80 transition-colors active:scale-95">
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-600">{currentGameScore}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-500 text-white rounded-full font-medium">
              الجولة {matchingRound}/5
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لعبة التوصيل</h1>
          <p className="text-gray-500">جدول {tableNumber} - وصّل الأسئلة بالإجابات</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-center text-gray-600 font-medium mb-2">الأسئلة</h3>
            {matchingQuestion.pairs.map((pair) => (
              <button
                key={pair.question}
                onClick={() => !pair.matched && handleSelectQuestion(pair.question)}
                disabled={pair.matched}
                className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                  pair.matched
                    ? 'bg-green-100 text-green-600 line-through'
                    : matchingQuestion.selectedQuestion === pair.question
                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-md'
                }`}
              >
                {pair.question}
                {pair.matched && <Check className="w-5 h-5 inline mr-2" />}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-center text-gray-600 font-medium mb-2">الإجابات</h3>
            {shuffledAnswers.map((answer, i) => {
              const isMatched = matchingQuestion.pairs.some(p => p.answer === answer && p.matched);
              return (
                <button
                  key={`${answer}-${i}`}
                  onClick={() => matchingQuestion.selectedQuestion && !isMatched && handleSelectAnswer(answer)}
                  disabled={isMatched || !matchingQuestion.selectedQuestion}
                  className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                    isMatched
                      ? 'bg-green-100 text-green-600 line-through'
                      : !matchingQuestion.selectedQuestion
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white/80 text-gray-700 hover:bg-emerald-100 shadow-md'
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-white/50 rounded-full p-1">
          <div 
            className="h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(matchingQuestion.matchedCount / 5) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-500 mt-2">تم توصيل {matchingQuestion.matchedCount}/5</p>
      </div>
    </div>
  );
}

export default function MatchingGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MatchingGameContent />
    </Suspense>
  );
}
