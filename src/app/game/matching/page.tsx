'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Star, Check } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

// ========== Helper Functions ==========
function generateMatchingQuestion(tableNumber: number) {
  const usedNumbers = new Set<number>();
  const pairs: { question: string; answer: number; matched: boolean }[] = [];
  
  while (pairs.length < 5) {
    const num2 = Math.floor(Math.random() * 9) + 1;
    if (!usedNumbers.has(num2)) {
      usedNumbers.add(num2);
      const answer = tableNumber * num2;
      pairs.push({
        question: `${tableNumber} × ${num2}`,
        answer,
        matched: false
      });
    }
  }
  
  return {
    pairs,
    selectedQuestion: null,
    selectedAnswer: null,
    matchedCount: 0
  };
}

function MatchingGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '2');
  const { status } = useSession();
  
  const { 
    matchingQuestion, 
    matchingRound,
    currentGameScore, 
    player,
    dispatch 
  } = useGameStore();
  
  const { playMatch } = useSound();
  const [localQuestion, setLocalQuestion] = useState(matchingQuestion);

  // تحميل بيانات اللاعب
  useEffect(() => {
    if (status === 'authenticated' && !player) {
      fetch('/api/player')
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            dispatch({ type: 'SET_PLAYER', payload: data });
          }
        })
        .catch(console.error);
    }
  }, [status, player, dispatch]);

  // إعادة تعيين الـ store عند تسجيل الخروج
  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch({ type: 'RESET_STORE' });
    }
  }, [status, dispatch]);

  // تهيئة اللعبة
  const initGame = useCallback(() => {
    const question = generateMatchingQuestion(tableNumber);
    setLocalQuestion(question);
    dispatch({ 
      type: 'SET_GAME_STATE', 
      payload: { 
        matchingQuestion: question,
        matchingRound: 1,
        currentGameScore: 0
      } 
    });
  }, [tableNumber, dispatch]);

  useEffect(() => {
    if (player && !localQuestion) {
      initGame();
    }
  }, [player, localQuestion, initGame]);

  // توجيه غير المسجلين
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/landing');
    }
  }, [status, router]);

  // الانتقال للنتائج بعد 5 جولات
  useEffect(() => {
    if (matchingRound > 5) {
      router.push('/results');
    }
  }, [matchingRound, router]);

  const handleSelectQuestion = (question: string) => {
    if (localQuestion) {
      setLocalQuestion(prev => prev ? { ...prev, selectedQuestion: question } : null);
    }
  };

  const handleSelectAnswer = (answer: number) => {
    if (!localQuestion?.selectedQuestion) return;
    
    const selectedPair = localQuestion.pairs.find(p => p.question === localQuestion.selectedQuestion);
    
    if (selectedPair && selectedPair.answer === answer && !selectedPair.matched) {
      const newPairs = localQuestion.pairs.map(p => 
        p.question === localQuestion.selectedQuestion ? { ...p, matched: true } : p
      );
      
      const newMatchedCount = localQuestion.matchedCount + 1;
      
      playMatch();
      
      // إضافة نقطة
      fetch('/api/player/points', { method: 'POST' }).catch(console.error);
      
      if (newMatchedCount === 5) {
        // الجولة انتهت
        setTimeout(() => {
          const newRound = (matchingRound || 1) + 1;
          if (newRound <= 5) {
            const newQuestion = generateMatchingQuestion(tableNumber);
            setLocalQuestion(newQuestion);
            dispatch({ 
              type: 'SET_GAME_STATE', 
              payload: { 
                matchingQuestion: newQuestion,
                matchingRound: newRound,
                currentGameScore: currentGameScore + 1
              } 
            });
          }
        }, 1000);
      } else {
        setLocalQuestion({
          ...localQuestion,
          pairs: newPairs,
          selectedQuestion: null,
          selectedAnswer: null,
          matchedCount: newMatchedCount
        });
      }
    } else {
      setLocalQuestion(prev => prev ? { ...prev, selectedQuestion: null } : null);
    }
  };

  // شاشة التحميل
  if (status === 'loading' || (status === 'authenticated' && !player)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !player || !localQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const shuffledAnswers = [...localQuestion.pairs]
    .map(p => p.answer)
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/home')} className="flex items-center gap-2 px-4 py-2 text-emerald-700 bg-white/50 rounded-full hover:bg-white/80 transition-colors active:scale-95">
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

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لعبة التوصيل</h1>
          <p className="text-gray-500">جدول {tableNumber} - وصّل الأسئلة بالإجابات</p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Questions */}
          <div className="space-y-3">
            <h3 className="text-center text-gray-600 font-medium mb-2">الأسئلة</h3>
            {localQuestion.pairs.map((pair) => (
              <button
                key={pair.question}
                onClick={() => !pair.matched && handleSelectQuestion(pair.question)}
                disabled={pair.matched}
                className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                  pair.matched
                    ? 'bg-green-100 text-green-600 line-through'
                    : localQuestion.selectedQuestion === pair.question
                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-md'
                }`}
              >
                {pair.question}
                {pair.matched && <Check className="w-5 h-5 inline mr-2" />}
              </button>
            ))}
          </div>

          {/* Answers */}
          <div className="space-y-3">
            <h3 className="text-center text-gray-600 font-medium mb-2">الإجابات</h3>
            {shuffledAnswers.map((answer, i) => {
              const isMatched = localQuestion.pairs.some(p => p.answer === answer && p.matched);
              return (
                <button
                  key={`${answer}-${i}`}
                  onClick={() => localQuestion.selectedQuestion && !isMatched && handleSelectAnswer(answer)}
                  disabled={isMatched || !localQuestion.selectedQuestion}
                  className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                    isMatched
                      ? 'bg-green-100 text-green-600 line-through'
                      : !localQuestion.selectedQuestion
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

        {/* Progress Bar */}
        <div className="mt-8 bg-white/50 rounded-full p-1">
          <div 
            className="h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(localQuestion.matchedCount / 5) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-500 mt-2">تم توصيل {localQuestion.matchedCount}/5</p>
      </div>
    </div>
  );
}

export default function MatchingGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MatchingGameContent />
    </Suspense>
  );
}
