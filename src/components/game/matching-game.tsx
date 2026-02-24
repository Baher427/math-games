'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowRight, Star, Trophy, Check, X, RefreshCw } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useSound } from '@/hooks/use-sound';

// ألوان الخطوط
const lineColors = [
  '#ef4444', // أحمر
  '#f97316', // برتقالي
  '#eab308', // أصفر
  '#22c55e', // أخضر
  '#3b82f6', // أزرق
];

interface LineData {
  questionIndex: number;
  answer: number;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface MistakeSummary {
  question: string;
  userAnswer: number;
  correctAnswer: number;
}

// دالة لتوليد أسئلة عشوائية
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

export function MatchingGame() {
  const { 
    matchingRound,
    selectedTable, 
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

  const containerRef = useRef<HTMLDivElement>(null);
  const questionElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const answerElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // توليد الأسئلة والإجابات
  const questions = useMemo(() => {
    if (!selectedTable) return [];
    return generateQuestions(selectedTable);
  }, [selectedTable, matchingRound]);

  const shuffledAnswers = useMemo(() => {
    return questions.map(q => q.answer).sort(() => Math.random() - 0.5);
  }, [questions]);

  // إعادة تعيين الحالة عند تغيير الجولة
  useEffect(() => {
    setLines([]);
    setSelectedQuestionIndex(null);
    setShowVerification(false);
    setMistakes([]);
    setShowRoundSummary(false);
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
    
    // تشغيل صوت التوصيل
    playMatch();
    
    setLines(prev => [...prev, {
      questionIndex: selectedQuestionIndex,
      answer,
      color: lineColors[selectedQuestionIndex],
      startX: questionPos.x,
      startY: questionPos.y,
      endX: answerPos.x,
      endY: answerPos.y
    }]);
    
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
    }
  };

  // الانتقال للجولة التالية
  const handleNextRound = () => {
    if (matchingRound >= 5) {
      if (perfectRounds >= 4) {
        dispatch({ type: 'ADD_POINTS', payload: 5 });
      }
      setShowRoundSummary(true);
    } else {
      dispatch({ type: 'NEXT_MATCHING_ROUND' });
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
  };

  // حساب مسار الخط المنحني
  const getCurvePath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlOffset = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  };

  // التحقق من اكتمال جميع الأسئلة
  const allQuestionsAnswered = lines.length === 5;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        {/* الشريط العلوي */}
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-6">
          <button
            onClick={() => dispatch({ type: 'GO_HOME' })}
            className="flex items-center gap-2 px-4 py-2 text-green-700 bg-white/50 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700">{perfectRounds}/4 جولات</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full">
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="font-bold text-green-700">{matchingRound}/5</span>
            </div>
          </div>
        </div>

        {/* العنوان */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">جدول {selectedTable}</h2>
          <p className="text-green-600/70">انقر على السؤال ثم على الإجابة الصحيحة</p>
          <p className="text-sm text-amber-600 mt-1">🎯 اربح 4 جولات بدون أخطاء = 5 نقاط!</p>
        </div>

        {/* منطقة اللعب */}
        <div
          ref={containerRef}
          className="flex-1 relative max-w-4xl mx-auto w-full"
        >
          {/* SVG للخطوط */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {lines.map((line, index) => {
              const isMistake = showVerification && mistakes.some(m => 
                m.question === questions[line.questionIndex]?.question
              );
              
              return (
                <path
                  key={`line-${index}`}
                  d={getCurvePath(line.startX, line.startY, line.endX, line.endY)}
                  stroke={isMistake ? '#ef4444' : line.color}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={isMistake ? "10,5" : "none"}
                />
              );
            })}
          </svg>

          {/* الأعمدة */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 lg:gap-24 relative z-0">
            {/* عمود الأسئلة */}
            <div className="space-y-4">
              <h3 className="text-center text-lg font-bold text-gray-600 mb-4">الأسئلة</h3>
              {questions.map((q, index) => {
                const answeredLine = getAnsweredQuestion(index);
                const isMistake = showVerification && mistakes.some(m => m.question === q.question);
                
                return (
                  <div
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
                    style={{
                      borderLeft: showVerification ? 'none' : `6px solid ${lineColors[index]}`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{q.question}</span>
                      {showVerification && !isMistake && answeredLine && (
                        <Check className="w-6 h-6 text-green-500" />
                      )}
                      {showVerification && isMistake && (
                        <X className="w-6 h-6 text-red-500" />
                      )}
                      {!showVerification && answeredLine && (
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* عمود الإجابات */}
            <div className="space-y-4">
              <h3 className="text-center text-lg font-bold text-gray-600 mb-4">الإجابات</h3>
              {shuffledAnswers.map((answer, index) => {
                const isUsed = lines.some(l => l.answer === answer);
                const isCorrect = questions.some(q => 
                  q.answer === answer && lines.some(l => l.questionIndex === questions.indexOf(q) && l.answer === answer)
                );
                
                return (
                  <div
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
                  >
                    <div className="flex items-center justify-between">
                      <span>{answer}</span>
                      {showVerification && isCorrect && (
                        <Check className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* زر التحقق / التعديل */}
        <div className="flex justify-center gap-4 mt-6">
          {!showVerification ? (
            <button
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
            >
              ✓ تحقق من الإجابات
            </button>
          ) : (
            <>
              {mistakes.length > 0 && (
                <button
                  onClick={handleEditAnswers}
                  className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  تعديل الإجابات
                </button>
              )}
              <button
                onClick={handleNextRound}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg active:scale-95"
              >
                {matchingRound >= 5 ? 'النتائج' : 'الجولة التالية'}
              </button>
            </>
          )}
        </div>

        {/* رسالة الأخطاء */}
        {showVerification && mistakes.length > 0 && (
          <div className="max-w-2xl mx-auto w-full mt-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4 text-center">
                ❌ الأخطاء في هذه الجولة
              </h3>
              <div className="space-y-3">
                {mistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-xl p-3 shadow"
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* رسالة النجاح */}
        {showVerification && mistakes.length === 0 && (
          <div className="max-w-md mx-auto w-full mt-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">أحسنت!</h3>
              <p className="text-gray-600">جميع الإجابات صحيحة!</p>
              <div className="flex items-center justify-center gap-2 text-amber-600 mt-4">
                <Star className="w-6 h-6" />
                <span className="font-bold">جولة كاملة!</span>
              </div>
            </div>
          </div>
        )}

        {/* ملخص نهاية اللعبة */}
        {showRoundSummary && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                <div className="text-6xl mb-2">
                  {perfectRounds >= 4 ? '🏆' : '📊'}
                </div>
                <h2 className="text-2xl font-bold">
                  {perfectRounds >= 4 ? 'مبروك! فزت بـ 5 نقاط!' : 'نتيجة اللعبة'}
                </h2>
                <p className="text-white/80 mt-1">
                  {perfectRounds}/4 جولات كاملة
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {allRoundMistakes.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
                      📝 الأخطاء التي تحتاج مراجعتها
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {allRoundMistakes.map((mistake, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3"
                        >
                          <span className="font-bold text-gray-700">{mistake.question}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 line-through text-sm">{mistake.userAnswer}</span>
                            <span className="text-green-600 font-bold">= {mistake.correctAnswer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">⭐</div>
                    <p className="text-gray-600 text-lg">أداء رائع! لا توجد أخطاء!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={handleEndGame}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95"
                >
                  إنهاء اللعبة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-4 text-green-600/50 text-sm">
          أكمل جميع التوصيلات ثم اضغط "تحقق"! 🔗
        </footer>
      </div>
    </div>
  );
}
