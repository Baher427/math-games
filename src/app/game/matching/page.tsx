'use client';

import { Suspense, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Star, Trophy, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';
import { motion, AnimatePresence } from 'framer-motion';

// ========== ألوان الخطوط والنقاط ==========
const lineColors = [
  { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' }, // أحمر
  { main: '#f97316', light: '#fdba74', dark: '#ea580c' }, // برتقالي
  { main: '#eab308', light: '#fde047', dark: '#ca8a04' }, // أصفر
  { main: '#22c55e', light: '#86efac', dark: '#16a34a' }, // أخضر
  { main: '#3b82f6', light: '#93c5fd', dark: '#2563eb' }, // أزرق
];

interface LineData {
  questionIndex: number;
  answer: number;
  color: typeof lineColors[0];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  animating: boolean;
}

interface MistakeSummary {
  question: string;
  userAnswer: number;
  correctAnswer: number;
}

// ========== Helper Functions ==========
function generateQuestions(tableNumber: number) {
  const usedNumbers = new Set<number>();
  const questions: { question: string; answer: number }[] = [];
  
  while (questions.length < 5) {
    const num2 = Math.floor(Math.random() * 9) + 1;
    if (!usedNumbers.has(num2)) {
      usedNumbers.add(num2);
      const answer = tableNumber * num2;
      questions.push({
        question: `${tableNumber} × ${num2}`,
        answer,
      });
    }
  }
  
  return questions;
}

function MatchingGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = parseInt(searchParams.get('table') || '2');
  const { status } = useSession();
  
  const { 
    matchingRound,
    currentGameScore, 
    player,
    dispatch 
  } = useGameStore();
  
  const { playMatch, playCorrect, playWrong, playWin } = useSound();

  // حالة اللعبة
  const [lines, setLines] = useState<LineData[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeSummary[]>([]);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [allRoundMistakes, setAllRoundMistakes] = useState<MistakeSummary[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const questionElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const answerElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // توليد الأسئلة والإجابات
  const questions = useMemo(() => {
    return generateQuestions(tableNumber);
  }, [tableNumber, matchingRound]);

  const shuffledAnswers = useMemo(() => {
    return questions.map(q => q.answer).sort(() => Math.random() - 0.5);
  }, [questions]);

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

  // التعامل مع زر الرجوع من المتصفح/الهاتف
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (lines.length > 0 && !showRoundSummary) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (lines.length > 0 && !showRoundSummary && !pendingExit) {
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
  }, [lines.length, showRoundSummary, pendingExit]);

  // تأكيد الخروج
  const confirmExit = useCallback(() => {
    setPendingExit(true);
    setShowExitConfirm(false);
    // حساب النتيجة والذهاب للنتائج
    dispatch({ type: 'END_GAME' });
    router.push('/results');
  }, [dispatch, router]);

  // توجيه غير المسجلين
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/landing');
    }
  }, [status, router]);

  // إعادة تعيين الحالة عند تغيير الجولة
  useEffect(() => {
    setLines([]);
    setSelectedQuestionIndex(null);
    setShowVerification(false);
    setMistakes([]);
    setShowRoundSummary(false);
    setIsReady(false);
    // تأخير بسيط للسماح للعناصر بالعرض
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, [matchingRound]);

  // تشغيل صوت عند التحقق
  useEffect(() => {
    if (showVerification) {
      if (mistakes.length === 0) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  }, [showVerification, mistakes.length, playCorrect, playWrong]);

  // تشغيل صوت عند الفوز
  useEffect(() => {
    if (showRoundSummary && perfectRounds >= 4) {
      playWin();
    }
  }, [showRoundSummary, perfectRounds, playWin]);

  // الحصول على موقع العنصر
  const getElementPosition = (element: HTMLDivElement | null) => {
    if (!element || !containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      x: elementRect.left - containerRect.left + elementRect.width / 2,
      y: elementRect.top - containerRect.top + elementRect.height / 2
    };
  };

  // تحديث مواقع الخطوط عند تغيير حجم الشاشة
  const updateLinePositions = useCallback(() => {
    if (lines.length === 0) return;
    
    setLines(prevLines => prevLines.map(line => {
      const questionEl = questionElementsRef.current[line.questionIndex];
      const answerIndex = shuffledAnswers.findIndex(a => a === line.answer);
      const answerEl = answerElementsRef.current[answerIndex];
      
      if (!containerRef.current) return line;
      const containerRect = containerRef.current.getBoundingClientRect();
      
      if (!questionEl || !answerEl) return line;
      
      const questionRect = questionEl.getBoundingClientRect();
      const answerRect = answerEl.getBoundingClientRect();
      
      return {
        ...line,
        startX: questionRect.left - containerRect.left + questionRect.width / 2,
        startY: questionRect.top - containerRect.top + questionRect.height / 2,
        endX: answerRect.left - containerRect.left + answerRect.width / 2,
        endY: answerRect.top - containerRect.top + answerRect.height / 2
      };
    }));
  }, [lines.length, shuffledAnswers]);

  // مراقبة تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      updateLinePositions();
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // تحديث أولي
    setTimeout(handleResize, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, [updateLinePositions]);

  // التحقق من إجابة السؤال
  const getAnsweredQuestion = (questionIndex: number) => {
    return lines.find(l => l.questionIndex === questionIndex);
  };

  // النقر على سؤال
  const handleQuestionSelect = (index: number) => {
    if (showVerification) return;
    
    const existingLine = lines.find(l => l.questionIndex === index);
    if (existingLine) {
      setLines(prev => prev.filter(l => l.questionIndex !== index));
    }
    
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else {
      setSelectedQuestionIndex(index);
    }
  };

  // النقر على إجابة
  const handleAnswerSelect = (answer: number) => {
    if (selectedQuestionIndex === null) return;
    if (showVerification) return;
    
    setLines(prev => prev.filter(l => l.questionIndex !== selectedQuestionIndex));
    
    const questionEl = questionElementsRef.current[selectedQuestionIndex];
    const answerIndex = shuffledAnswers.findIndex(a => a === answer);
    const answerEl = answerElementsRef.current[answerIndex];
    
    const questionPos = getElementPosition(questionEl);
    const answerPos = getElementPosition(answerEl);
    
    if (!questionPos || !answerPos) return;
    
    playMatch();
    
    const newLine: LineData = {
      questionIndex: selectedQuestionIndex,
      answer,
      color: lineColors[selectedQuestionIndex],
      startX: questionPos.x,
      startY: questionPos.y,
      endX: answerPos.x,
      endY: answerPos.y,
      animating: true
    };
    
    setLines(prev => [...prev, newLine]);
    
    setTimeout(() => {
      setLines(prev => prev.map(l => 
        l.questionIndex === selectedQuestionIndex ? { ...l, animating: false } : l
      ));
    }, 500);
    
    setSelectedQuestionIndex(null);
  };

  // التحقق من الإجابات
  const handleVerify = () => {
    const newMistakes: MistakeSummary[] = [];
    
    questions.forEach((q, index) => {
      const line = lines.find(l => l.questionIndex === index);
      if (!line || line.answer !== q.answer) {
        newMistakes.push({
          question: q.question,
          userAnswer: line?.answer || 0,
          correctAnswer: q.answer
        });
      }
    });
    
    setMistakes(newMistakes);
    setShowVerification(true);
    
    if (newMistakes.length > 0) {
      setAllRoundMistakes(prev => [...prev, ...newMistakes]);
    } else {
      setPerfectRounds(prev => prev + 1);
      // إضافة نقطة للجولة الكاملة
      fetch('/api/player/points', { method: 'POST' }).catch(console.error);
    }
  };

  // الانتقال للجولة التالية
  const handleNextRound = () => {
    if (matchingRound >= 5) {
      if (perfectRounds >= 4) {
        // إضافة 5 نقاط إضافية
        for (let i = 0; i < 5; i++) {
          fetch('/api/player/points', { method: 'POST' }).catch(console.error);
        }
      }
      setShowRoundSummary(true);
    } else {
      dispatch({ type: 'SET_GAME_STATE', payload: { matchingRound: matchingRound + 1 } });
    }
  };

  // العودة للتعديل
  const handleEditAnswers = () => {
    setShowVerification(false);
    setMistakes([]);
  };

  // إنهاء اللعبة من الملخص
  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' });
    router.push('/results');
  };

  // حساب مسار الخط المنحني
  const getCurvePath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlOffset = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  };

  // التحقق من اكتمال جميع الأسئلة
  const allQuestionsAnswered = lines.length === 5;

  // شاشة التحميل
  if (status === 'loading' || (status === 'authenticated' && !player)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  if (status === 'unauthenticated' || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-6">
          <button
            onClick={() => {
              if (lines.length > 0 && !showRoundSummary) {
                setShowExitConfirm(true);
              } else {
                dispatch({ type: 'GO_HOME' });
                router.push('/home');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-green-700 bg-white/50 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>

          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700">{perfectRounds}/4 جولات</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="font-bold text-green-700">{matchingRound}/5</span>
            </motion.div>
          </div>
        </div>

        {/* العنوان */}
        <div className="text-center mb-4">
          <motion.h2 
            className="text-2xl font-bold text-green-700"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            جدول {tableNumber}
          </motion.h2>
          <p className="text-green-600/70">انقر على السؤال ثم على الإجابة الصحيحة</p>
          <p className="text-sm text-amber-600 mt-1">🎯 اربح 4 جولات بدون أخطاء = 5 نقاط!</p>
        </div>

        {/* منطقة اللعب */}
        <div
          ref={containerRef}
          className="flex-1 relative max-w-4xl mx-auto w-full min-h-[400px]"
        >
          {/* SVG للخطوط - فوق كل العناصر */}
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ 
              overflow: 'visible', 
              zIndex: 30,
              minHeight: '100%',
              width: '100%',
              height: '100%'
            }}
          >
            <defs>
              {lineColors.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`line-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color.main} />
                  <stop offset="50%" stopColor={color.light} />
                  <stop offset="100%" stopColor={color.main} />
                </linearGradient>
              ))}
              {lineColors.map((color, index) => (
                <filter key={`glow-${index}`} id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              ))}
            </defs>
            
            {lines.map((line, idx) => {
              const isMistake = showVerification && mistakes.some(m => 
                m.question === questions[line.questionIndex]?.question
              );
              
              return (
                <motion.path
                  key={`line-${idx}-${matchingRound}-${line.questionIndex}`}
                  d={getCurvePath(line.startX, line.startY, line.endX, line.endY)}
                  stroke={isMistake ? '#ef4444' : `url(#line-gradient-${line.questionIndex})`}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={isMistake ? "10,5" : "none"}
                  filter={!isMistake && !showVerification ? `url(#glow-${line.questionIndex})` : ''}
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    strokeWidth: 0
                  }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 1,
                    strokeWidth: 8
                  }}
                  transition={{ 
                    pathLength: { duration: 0.5, ease: 'easeOut' },
                    opacity: { duration: 0.3 },
                    strokeWidth: { duration: 0.3 }
                  }}
                />
              );
            })}
          </svg>

          {/* الأعمدة */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 lg:gap-24 relative" style={{ zIndex: 10 }}>
            {/* عمود الأسئلة */}
            <div className="space-y-4">
              <h3 className="text-center text-lg font-bold text-gray-600 mb-4">الأسئلة</h3>
              {questions.map((q, index) => {
                const answeredLine = getAnsweredQuestion(index);
                const isMistake = showVerification && mistakes.some(m => m.question === q.question);
                const colorData = lineColors[index];
                
                return (
                  <motion.div
                    key={`q-${index}`}
                    ref={el => { questionElementsRef.current[index] = el; }}
                    onClick={() => handleQuestionSelect(index)}
                    className={`
                      relative p-4 rounded-2xl text-xl font-bold cursor-pointer
                      transition-all duration-200 select-none active:scale-95
                      ${showVerification
                        ? isMistake
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : answeredLine
                          ? 'bg-green-100 text-green-600 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-400'
                        : selectedQuestionIndex === index
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl'
                        : answeredLine
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                        : 'bg-white/80 text-gray-700 shadow-lg hover:shadow-xl'
                      }
                    `}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={!showVerification ? { scale: 1.02 } : {}}
                    whileTap={!showVerification ? { scale: 0.98 } : {}}
                  >
                    {/* نقطة اللون */}
                    <motion.div
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: colorData.main }}
                      initial={{ scale: 0 }}
                      animate={{ scale: answeredLine || selectedQuestionIndex === index ? 1.2 : 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    />
                    
                    <div className="flex items-center justify-between pr-4">
                      <span>{q.question}</span>
                      {showVerification && !isMistake && answeredLine && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Check className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                      {showVerification && isMistake && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <X className="w-6 h-6 text-red-500" />
                        </motion.div>
                      )}
                      {!showVerification && answeredLine && (
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* عمود الإجابات */}
            <div className="space-y-4">
              <h3 className="text-center text-lg font-bold text-gray-600 mb-4">الإجابات</h3>
              {shuffledAnswers.map((answer, index) => {
                const isUsed = lines.some(l => l.answer === answer);
                const connectedLine = lines.find(l => l.answer === answer);
                const isCorrect = questions.some(q => 
                  q.answer === answer && lines.some(l => l.questionIndex === questions.indexOf(q) && l.answer === answer)
                );
                
                return (
                  <motion.div
                    key={`a-${answer}-${index}`}
                    ref={el => { answerElementsRef.current[index] = el; }}
                    onClick={() => !showVerification && handleAnswerSelect(answer)}
                    className={`
                      p-4 rounded-2xl text-xl font-bold
                      transition-all duration-200 select-none active:scale-95
                      ${showVerification
                        ? isCorrect
                          ? 'bg-green-100 text-green-600 border-2 border-green-300'
                          : isUsed && !isCorrect
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-white/50 text-gray-400'
                        : selectedQuestionIndex !== null
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg cursor-pointer'
                        : 'bg-white/80 text-gray-700 shadow-lg hover:shadow-xl cursor-pointer'
                      }
                    `}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={!showVerification && selectedQuestionIndex !== null ? { scale: 1.05 } : {}}
                    whileTap={!showVerification && selectedQuestionIndex !== null ? { scale: 0.95 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span>{answer}</span>
                      {showVerification && isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Check className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                      {connectedLine && !showVerification && (
                        <motion.div
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: connectedLine.color.main }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* زر التحقق / التعديل */}
        <div className="flex justify-center gap-4 mt-6">
          {!showVerification ? (
            <motion.button
              onClick={handleVerify}
              disabled={!allQuestionsAnswered}
              className={`
                px-8 py-4 rounded-full font-bold text-lg shadow-lg
                transition-all duration-200 active:scale-95
                ${allQuestionsAnswered
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
              whileHover={allQuestionsAnswered ? { scale: 1.05 } : {}}
              whileTap={allQuestionsAnswered ? { scale: 0.95 } : {}}
            >
              ✓ تحقق من الإجابات
            </motion.button>
          ) : (
            <>
              {mistakes.length > 0 && (
                <motion.button
                  onClick={handleEditAnswers}
                  className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold shadow-lg active:scale-95"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  تعديل الإجابات
                </motion.button>
              )}
              <motion.button
                onClick={handleNextRound}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {matchingRound >= 5 ? 'النتائج' : 'الجولة التالية'}
              </motion.button>
            </>
          )}
        </div>

        {/* رسالة الأخطاء */}
        <AnimatePresence>
          {showVerification && mistakes.length > 0 && (
            <motion.div 
              className="max-w-2xl mx-auto w-full mt-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">
                  ❌ الأخطاء في هذه الجولة
                </h3>
                <div className="space-y-3">
                  {mistakes.map((mistake, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between bg-white rounded-xl p-3 shadow"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="font-bold text-gray-700">{mistake.question}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-red-500 line-through">
                          {mistake.userAnswer || 'لم يجيب'}
                        </span>
                        <span className="text-green-600 font-bold">
                          = {mistake.correctAnswer}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* رسالة النجاح */}
        <AnimatePresence>
          {showVerification && mistakes.length === 0 && (
            <motion.div 
              className="max-w-md mx-auto w-full mt-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">أحسنت!</h3>
                <p className="text-gray-600">جميع الإجابات صحيحة!</p>
                <div className="flex items-center justify-center gap-2 text-amber-600 mt-4">
                  <Star className="w-6 h-6" />
                  <span className="font-bold">جولة كاملة!</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ملخص نهاية اللعبة */}
        <AnimatePresence>
          {showRoundSummary && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: 50 }}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                  <motion.div 
                    className="text-6xl mb-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    {perfectRounds >= 4 ? '🏆' : '📊'}
                  </motion.div>
                  <h2 className="text-2xl font-bold">
                    {perfectRounds >= 4 ? 'مبروك! فزت بـ 5 نقاط!' : 'نتيجة اللعبة'}
                  </h2>
                  <p className="text-white/80 mt-1">
                    {perfectRounds}/4 جولات كاملة
                  </p>
                </div>

                <div className="p-6">
                  {allRoundMistakes.length > 0 ? (
                    <>
                      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
                        📝 الأخطاء التي تحتاج مراجعتها
                      </h3>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {allRoundMistakes.map((mistake, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="font-bold text-gray-700">{mistake.question}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-red-500 line-through text-sm">{mistake.userAnswer}</span>
                              <span className="text-green-600 font-bold">= {mistake.correctAnswer}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <motion.div 
                        className="text-6xl mb-4"
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                      >
                        ⭐
                      </motion.div>
                      <p className="text-gray-600 text-lg">أداء رائع! لا توجد أخطاء!</p>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0">
                  <motion.button
                    onClick={handleEndGame}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إنهاء اللعبة
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <p className="text-gray-600 mb-6">
                    سيتم إنهاء اللعبة وعرض نتيجتك الحالية
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

        {/* Footer */}
        <footer className="text-center py-4 text-green-600/50 text-sm">
          أكمل جميع التوصيلات ثم اضغط "تحقق"! 🔗
        </footer>
      </div>
    </div>
  );
}

export default function MatchingGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
          className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full" 
        />
      </div>
    }>
      <MatchingGameContent />
    </Suspense>
  );
}
