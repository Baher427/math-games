'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Trophy, Check, X, Sparkles, Zap } from 'lucide-react';
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
  const [questionKey, setQuestionKey] = useState(0);

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
        setQuestionKey(prev => prev + 1);
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

  const correctAnswer = trueFalseQuestion.num1 * trueFalseQuestion.num2;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* دوائر متحركة */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-pink-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-rose-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-500 rounded-full blur-3xl"
        />
        
        {/* نجوم متلألئة */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* الشريط العلوي */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between w-full max-w-2xl mx-auto mb-6"
        >
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-5 py-2.5 text-white/90 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 border border-white/10"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'END_GAME' })}
            className="px-5 py-2.5 text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-full font-medium shadow-lg shadow-rose-500/25 active:scale-95 hover:shadow-xl hover:shadow-rose-500/30 transition-all"
          >
            إنهاء اللعب
          </button>
        </motion.div>

        {/* بطاقة النقاط */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-amber-500/20"
          >
            <Star className="w-6 h-6 text-amber-400" fill="currentColor" />
            <span className="text-2xl font-bold text-amber-400">{currentGameScore}</span>
            <span className="text-amber-400/70">نقطة</span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-md rounded-2xl border border-pink-500/20"
          >
            <Trophy className="w-6 h-6 text-pink-400" />
            <span className="text-2xl font-bold text-pink-400">{totalQuestions}</span>
            <span className="text-pink-400/70">سؤال</span>
          </motion.div>
        </motion.div>

        {/* منطقة اللعب */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {/* رقم الجدول */}
          <motion.div 
            key={questionKey}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 px-5 py-2 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 backdrop-blur-md rounded-full border border-fuchsia-500/30"
          >
            <span className="text-fuchsia-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              جدول {selectedTable}
            </span>
          </motion.div>

          {/* السؤال */}
          <motion.div 
            key={`question-${questionKey}`}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-white/10"
          >
            <div className="text-center">
              <motion.div 
                className="text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {trueFalseQuestion.num1} × {trueFalseQuestion.num2} = {trueFalseQuestion.displayedAnswer}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-2xl text-white/60 font-light"
              >
                هل هذه المعادلة صحيحة؟
              </motion.div>
            </div>
          </motion.div>

          {/* أزرار الصح والخطأ */}
          <div className="flex gap-6 w-full max-w-md">
            {/* زر صح */}
            <motion.button
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={!hasAnswered ? { scale: 1.05, y: -5 } : {}}
              whileTap={!hasAnswered ? { scale: 0.95 } : {}}
              onClick={() => handleAnswer(true)}
              disabled={hasAnswered}
              className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center gap-3 py-8 rounded-3xl text-2xl font-bold transition-all ${
                hasAnswered
                  ? isCorrect && trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-emerald-500/30'
                    : !isCorrect && !trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-emerald-500/30'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                  : 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
              }`}
            >
              {/* تأثير لامع */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"
              />
              
              {/* أيقونة متحركة */}
              <motion.div
                animate={!hasAnswered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Check className="w-14 h-14" strokeWidth={3} />
              </motion.div>
              <span className="relative z-10">صح</span>
              
              {/* تأثير النبض */}
              {!hasAnswered && (
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-emerald-400"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>

            {/* زر خطأ */}
            <motion.button
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={!hasAnswered ? { scale: 1.05, y: -5 } : {}}
              whileTap={!hasAnswered ? { scale: 0.95 } : {}}
              onClick={() => handleAnswer(false)}
              disabled={hasAnswered}
              className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center gap-3 py-8 rounded-3xl text-2xl font-bold transition-all ${
                hasAnswered
                  ? isCorrect && !trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-rose-500/30'
                    : !isCorrect && trueFalseQuestion.isCorrect
                    ? 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-rose-500/30'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                  : 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30'
              }`}
            >
              {/* تأثير لامع */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"
              />
              
              {/* أيقونة متحركة */}
              <motion.div
                animate={!hasAnswered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <X className="w-14 h-14" strokeWidth={3} />
              </motion.div>
              <span className="relative z-10">خطأ</span>
              
              {/* تأثير النبض */}
              {!hasAnswered && (
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-rose-400"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              )}
            </motion.button>
          </div>

          {/* رسالة النتيجة */}
          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="mt-8 text-center"
              >
                {isCorrect ? (
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-emerald-400 rounded-full blur-xl"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="relative text-7xl">🎉</span>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-2xl font-bold text-emerald-400 mt-3"
                    >
                      <Zap className="w-6 h-6" fill="currentColor" />
                      أحسنت! +1 نقطة
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-7xl">😔</span>
                    </motion.div>
                    <span className="mt-3 text-xl text-white/70 mb-2">
                      {trueFalseQuestion.isCorrect 
                        ? 'المعادلة كانت صحيحة!' 
                        : 'المعادلة كانت خاطئة!'
                      }
                    </span>
                    <span className="text-lg text-white/50">
                      الإجابة الصحيحة: <span className="font-bold text-emerald-400 text-xl">{correctAnswer}</span>
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-white/30 text-sm">
          حدد إذا كانت المعادلة صحيحة أم خاطئة! ✅❌
        </footer>
      </div>
    </div>
  );
}
