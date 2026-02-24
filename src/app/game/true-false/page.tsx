'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Star, Trophy, Check, X, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';
import { motion, AnimatePresence } from 'framer-motion';

// ========== Helper Functions ==========
function generateTrueFalseQuestion(tableNumber: number) {
  const num2 = Math.floor(Math.random() * 9) + 1;
  const correctAnswer = tableNumber * num2;
  
  const isCorrect = Math.random() > 0.5;
  const displayedAnswer = isCorrect 
    ? correctAnswer 
    : correctAnswer + (Math.floor(Math.random() * 10) - 5) || correctAnswer + 1;
  
  return {
    question: {
      num1: tableNumber,
      num2,
      displayedAnswer,
      isCorrect
    },
    questionKey: `${tableNumber}-${num2}`
  };
}

function TrueFalseGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '2');
  const { status } = useSession();
  
  const { 
    trueFalseQuestion, 
    currentGameScore, 
    totalQuestions, 
    hasAnswered, 
    isCorrect, 
    player,
    dispatch 
  } = useGameStore();
  
  const { playCorrect, playWrong } = useSound();

  // حالة تأكيد الخروج
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);

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
    const { question } = generateTrueFalseQuestion(tableNumber);
    dispatch({ 
      type: 'SET_GAME_STATE', 
      payload: { 
        trueFalseQuestion: question,
        currentGameScore: 0,
        totalQuestions: 0,
        hasAnswered: false,
        isCorrect: null
      } 
    });
  }, [tableNumber, dispatch]);

  useEffect(() => {
    if (player && !trueFalseQuestion) {
      initGame();
    }
  }, [player, trueFalseQuestion, initGame]);

  // توجيه غير المسجلين
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/landing');
    }
  }, [status, router]);

  // التعامل مع زر الرجوع من المتصفح/الهاتف
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (totalQuestions > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (totalQuestions > 0 && !pendingExit) {
        e.preventDefault();
        setShowExitConfirm(true);
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [totalQuestions, pendingExit]);

  // تشغيل الصوت
  useEffect(() => {
    if (hasAnswered) {
      if (isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  }, [hasAnswered, isCorrect, playCorrect, playWrong]);

  // الانتقال التلقائي
  useEffect(() => {
    if (hasAnswered && trueFalseQuestion) {
      const timer = setTimeout(() => {
        const { question } = generateTrueFalseQuestion(tableNumber);
        dispatch({ 
          type: 'SET_GAME_STATE', 
          payload: { 
            trueFalseQuestion: question,
            hasAnswered: false,
            isCorrect: null
          } 
        });
      }, isCorrect ? 1500 : 2500);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, isCorrect, tableNumber, dispatch, trueFalseQuestion]);

  const handleAnswer = (answer: boolean) => {
    if (!hasAnswered && trueFalseQuestion) {
      const correct = answer === trueFalseQuestion.isCorrect;
      
      dispatch({ 
        type: 'SET_GAME_STATE', 
        payload: { 
          hasAnswered: true,
          isCorrect: correct,
          currentGameScore: correct ? currentGameScore + 1 : currentGameScore,
          totalQuestions: totalQuestions + 1
        } 
      });

      if (correct) {
        fetch('/api/player/points', { method: 'POST' }).catch(console.error);
      }
    }
  };

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' });
    router.push('/results');
  };

  // تأكيد الخروج
  const confirmExit = useCallback(() => {
    setPendingExit(true);
    setShowExitConfirm(false);
    handleEndGame();
  }, [handleEndGame]);

  // شاشة التحميل
  if (status === 'loading' || (status === 'authenticated' && !player)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  if (status === 'unauthenticated' || !player || !trueFalseQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  const correctAnswer = trueFalseQuestion.num1 * trueFalseQuestion.num2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              if (totalQuestions > 0) {
                setShowExitConfirm(true);
              } else {
                dispatch({ type: 'GO_HOME' });
                router.push('/home');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-white/50 rounded-full hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
          <button 
            onClick={() => {
              if (totalQuestions > 0) {
                setShowExitConfirm(true);
              } else {
                handleEndGame();
              }
            }}
            className="px-4 py-2 text-white bg-gradient-to-r from-red-400 to-pink-500 rounded-full font-medium shadow-lg active:scale-95"
          >
            إنهاء اللعب
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.div 
            className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Star className="w-6 h-6 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{currentGameScore}</span>
            <span className="text-amber-600/70">نقطة</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          >
            <Trophy className="w-6 h-6 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{totalQuestions}</span>
            <span className="text-purple-600/70">سؤال</span>
          </motion.div>
        </div>

        {/* Question */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-center">
            <div className="mb-4 px-4 py-1 bg-purple-100 rounded-full text-purple-600 font-medium inline-block">
              جدول {tableNumber}
            </div>
            <div className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
              {trueFalseQuestion.num1} × {trueFalseQuestion.num2} = {trueFalseQuestion.displayedAnswer}
            </div>
            <p className="text-xl text-gray-500">هل هذه المعادلة صحيحة؟</p>
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <motion.button
            onClick={() => handleAnswer(true)}
            disabled={hasAnswered}
            className={`w-32 h-32 rounded-3xl text-5xl font-bold transition-all shadow-lg active:scale-90 ${
              hasAnswered && trueFalseQuestion.isCorrect
                ? 'bg-green-500 text-white ring-4 ring-green-300'
                : hasAnswered && !trueFalseQuestion.isCorrect
                ? 'bg-red-100 text-red-300'
                : 'bg-white hover:bg-green-50 text-green-500 hover:ring-4 hover:ring-green-200'
            }`}
            whileHover={!hasAnswered ? { scale: 1.05 } : {}}
            whileTap={!hasAnswered ? { scale: 0.95 } : {}}
          >
            <Check className="w-16 h-16 mx-auto" />
          </motion.button>
          <motion.button
            onClick={() => handleAnswer(false)}
            disabled={hasAnswered}
            className={`w-32 h-32 rounded-3xl text-5xl font-bold transition-all shadow-lg active:scale-90 ${
              hasAnswered && !trueFalseQuestion.isCorrect
                ? 'bg-red-500 text-white ring-4 ring-red-300'
                : hasAnswered && trueFalseQuestion.isCorrect
                ? 'bg-green-100 text-green-300'
                : 'bg-white hover:bg-red-50 text-red-500 hover:ring-4 hover:ring-red-200'
            }`}
            whileHover={!hasAnswered ? { scale: 1.05 } : {}}
            whileTap={!hasAnswered ? { scale: 0.95 } : {}}
          >
            <X className="w-16 h-16 mx-auto" />
          </motion.button>
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div 
              className="mt-8 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {isCorrect ? (
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="text-6xl mb-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    🎉
                  </motion.div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* رسالة تأكيد الخروج */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  هل تريد الخروج؟
                </h3>
                <p className="text-gray-600 mb-2">
                  سيتم إنهاء اللعبة وعرض نتيجتك
                </p>
                <p className="text-amber-600 font-bold mb-6">
                  النتيجة: {currentGameScore}/{totalQuestions}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    onClick={confirmExit}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    خروج
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrueFalseGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full" 
        />
      </div>
    }>
      <TrueFalseGameContent />
    </Suspense>
  );
}
