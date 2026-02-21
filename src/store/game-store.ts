import { create } from 'zustand';
import { GameState, GameAction, ChoicesQuestion, MatchingQuestion, TrueFalseQuestion } from '@/types/game';

// ========== دوال مساعدة ==========

// دالة لتوليد خيارات عشوائية
function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>();
  options.add(correctAnswer);
  
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrongAnswer = correctAnswer + offset;
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }
  
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// دالة لتوليد سؤال اختيارات مع توزيع عادل
function generateChoicesQuestion(
  tableNumber: number, 
  usedQuestions: Set<string>,
  focusQuestions: Set<string>,
  lastQuestion: string | null
): { question: ChoicesQuestion; questionKey: string } {
  
  // أولوية للأسئلة التي أخطأ فيها المستخدم (فocus questions)
  const availableFocus = Array.from(focusQuestions).filter(q => q !== lastQuestion);
  
  if (availableFocus.length > 0 && Math.random() < 0.6) {
    // 60% فرصة لإظهار سؤال من قائمة التركيز
    const focusKey = availableFocus[Math.floor(Math.random() * availableFocus.length)];
    const [_, num2Str] = focusKey.split('-');
    const num2 = parseInt(num2Str);
    const correctAnswer = tableNumber * num2;
    
    return {
      question: {
        num1: tableNumber,
        num2,
        correctAnswer,
        options: generateOptions(correctAnswer)
      },
      questionKey: focusKey
    };
  }
  
  // الحصول على الأرقام المتاحة (من 1 إلى 9)
  const allNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  // استبعاد السؤال الأخير
  const availableNumbers = allNumbers.filter(num => {
    const key = `${tableNumber}-${num}`;
    return key !== lastQuestion;
  });
  
  // تقسيم الأرقام إلى مستخدمة وغير مستخدمة
  const unusedNumbers = availableNumbers.filter(num => {
    const key = `${tableNumber}-${num}`;
    return !usedQuestions.has(key);
  });
  
  // إذا كل الأرقام اتعملت، نبدأ من جديد
  if (unusedNumbers.length === 0) {
    const num2 = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    const correctAnswer = tableNumber * num2;
    
    return {
      question: {
        num1: tableNumber,
        num2,
        correctAnswer,
        options: generateOptions(correctAnswer)
      },
      questionKey: `${tableNumber}-${num2}`
    };
  }
  
  // اختيار رقم عشوائي من غير المستخدمة
  const num2 = unusedNumbers[Math.floor(Math.random() * unusedNumbers.length)];
  const correctAnswer = tableNumber * num2;
  
  return {
    question: {
      num1: tableNumber,
      num2,
      correctAnswer,
      options: generateOptions(correctAnswer)
    },
    questionKey: `${tableNumber}-${num2}`
  };
}

// دالة لتوليد سؤال توصيل (5 أزواج)
function generateMatchingQuestion(tableNumber: number): MatchingQuestion {
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

// دالة لتوليد سؤال صح وخطأ مع توزيع عادل
function generateTrueFalseQuestion(
  tableNumber: number,
  usedQuestions: Set<string>,
  focusQuestions: Set<string>,
  lastQuestion: string | null
): { question: TrueFalseQuestion; questionKey: string } {
  
  // أولوية للأسئلة التي أخطأ فيها المستخدم
  const availableFocus = Array.from(focusQuestions).filter(q => q !== lastQuestion);
  
  if (availableFocus.length > 0 && Math.random() < 0.6) {
    const focusKey = availableFocus[Math.floor(Math.random() * availableFocus.length)];
    const [_, num2Str] = focusKey.split('-');
    const num2 = parseInt(num2Str);
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
      questionKey: focusKey
    };
  }
  
  const allNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  const availableNumbers = allNumbers.filter(num => {
    const key = `${tableNumber}-${num}`;
    return key !== lastQuestion;
  });
  
  const unusedNumbers = availableNumbers.filter(num => {
    const key = `${tableNumber}-${num}`;
    return !usedQuestions.has(key);
  });
  
  let num2: number;
  if (unusedNumbers.length === 0) {
    num2 = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  } else {
    num2 = unusedNumbers[Math.floor(Math.random() * unusedNumbers.length)];
  }
  
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

// ========== دالة حفظ النقاط في API ==========
async function savePointsToApi(): Promise<number | null> {
  try {
    const response = await fetch('/api/player/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.points;
    }
  } catch (error) {
    console.error('Error saving points:', error);
  }
  return null;
}

// ========== الحالة الابتدائية ==========
const initialState: GameState = {
  currentScreen: 'home',
  screenHistory: [],
  selectedGame: null,
  selectedTable: null,
  currentGameScore: 0,
  totalQuestions: 0,
  answers: [],
  choicesQuestion: null,
  hasAnswered: false,
  selectedAnswer: null,
  isCorrect: null,
  matchingQuestion: null,
  matchingRound: 1,
  trueFalseQuestion: null,
  player: null,
  isLoading: true,
  // جديد: تتبع الأسئلة
  usedQuestions: new Set<string>(),
  focusQuestions: new Set<string>(),
  lastQuestion: null
};

export const useGameStore = create<GameState & { dispatch: (action: GameAction) => void }>((set, get) => ({
  ...initialState,
  
  dispatch: (action: GameAction) => {
    switch (action.type) {
      // ========== التنقل ==========
      case 'SELECT_GAME':
        set(state => ({
          selectedGame: action.payload,
          currentScreen: 'table-select',
          screenHistory: [...state.screenHistory, state.currentScreen]
        }));
        break;
        
      case 'SELECT_TABLE': {
        const { selectedGame } = get();
        let newState: Partial<GameState> = {
          selectedTable: action.payload,
          currentScreen: 'game',
          currentGameScore: 0,
          totalQuestions: 0,
          answers: [],
          hasAnswered: false,
          selectedAnswer: null,
          isCorrect: null,
          usedQuestions: new Set<string>(),
          focusQuestions: new Set<string>(),
          lastQuestion: null,
          screenHistory: [...get().screenHistory, 'table-select']
        };
        
        if (selectedGame === 'choices') {
          const { question, questionKey } = generateChoicesQuestion(action.payload, new Set(), new Set(), null);
          newState.choicesQuestion = question;
          newState.lastQuestion = questionKey;
          newState.usedQuestions = new Set([questionKey]);
        } else if (selectedGame === 'matching') {
          newState.matchingQuestion = generateMatchingQuestion(action.payload);
          newState.matchingRound = 1;
        } else if (selectedGame === 'true-false') {
          const { question, questionKey } = generateTrueFalseQuestion(action.payload, new Set(), new Set(), null);
          newState.trueFalseQuestion = question;
          newState.lastQuestion = questionKey;
          newState.usedQuestions = new Set([questionKey]);
        }
        
        set(newState);
        break;
      }
        
      case 'START_GAME': {
        const { gameType, tableNumber } = action.payload;
        let newState: Partial<GameState> = {
          selectedGame: gameType,
          selectedTable: tableNumber,
          currentScreen: 'game',
          currentGameScore: 0,
          totalQuestions: 0,
          answers: [],
          hasAnswered: false,
          selectedAnswer: null,
          isCorrect: null,
          usedQuestions: new Set<string>(),
          focusQuestions: new Set<string>(),
          lastQuestion: null,
          screenHistory: []
        };
        
        if (gameType === 'choices') {
          const { question, questionKey } = generateChoicesQuestion(tableNumber, new Set(), new Set(), null);
          newState.choicesQuestion = question;
          newState.lastQuestion = questionKey;
          newState.usedQuestions = new Set([questionKey]);
        } else if (gameType === 'matching') {
          newState.matchingQuestion = generateMatchingQuestion(tableNumber);
          newState.matchingRound = 1;
        } else if (gameType === 'true-false') {
          const { question, questionKey } = generateTrueFalseQuestion(tableNumber, new Set(), new Set(), null);
          newState.trueFalseQuestion = question;
          newState.lastQuestion = questionKey;
          newState.usedQuestions = new Set([questionKey]);
        }
        
        set(newState);
        break;
      }
        
      case 'GO_HOME':
        set({
          ...initialState,
          player: get().player,
          isLoading: false,
          screenHistory: []
        });
        break;
        
      case 'GO_TO_PROFILE':
        set(state => ({ 
          currentScreen: 'profile',
          screenHistory: [...state.screenHistory, state.currentScreen]
        }));
        break;
        
      case 'GO_TO_ADMIN':
        set(state => ({ 
          currentScreen: 'admin',
          screenHistory: [...state.screenHistory, state.currentScreen]
        }));
        break;
        
      case 'GO_BACK': {
        const { screenHistory } = get();
        if (screenHistory.length > 0) {
          const previousScreen = screenHistory[screenHistory.length - 1];
          set({
            currentScreen: previousScreen,
            screenHistory: screenHistory.slice(0, -1)
          });
        } else {
          // لو مفيش history، نرجع للـ home
          set({
            ...initialState,
            player: get().player,
            isLoading: false,
            screenHistory: []
          });
        }
        break;
      }
        
      // ========== بيانات اللاعب ==========
      case 'SET_PLAYER':
        // تنظيف كامل عند تسجيل الدخول الجديد
        set({ 
          player: action.payload, 
          isLoading: false,
          currentScreen: 'home',
          selectedGame: null,
          selectedTable: null,
          currentGameScore: 0,
          totalQuestions: 0,
          answers: [],
          choicesQuestion: null,
          hasAnswered: false,
          selectedAnswer: null,
          isCorrect: null,
          matchingQuestion: null,
          matchingRound: 1,
          trueFalseQuestion: null,
          usedQuestions: new Set<string>(),
          focusQuestions: new Set<string>(),
          lastQuestion: null
        });
        break;
        
      case 'UPDATE_PLAYER_DATA':
        // تحديث بيانات اللاعب بدون تغيير الشاشة
        set(state => ({
          player: state.player ? { ...state.player, ...action.payload } : null
        }));
        break;
        
      case 'UPDATE_PLAYER_NAME':
        set(state => ({
          player: state.player ? { ...state.player, name: action.payload } : null
        }));
        break;
        
      case 'UPDATE_PLAYER_AVATAR':
        set(state => ({
          player: state.player ? { ...state.player, avatarId: action.payload } : null
        }));
        break;
        
      case 'ADD_POINTS': {
        set(state => ({
          player: state.player ? { ...state.player, points: state.player.points + 1 } : null
        }));
        savePointsToApi().then(newPoints => {
          if (newPoints !== null) {
            set(state => ({
              player: state.player ? { ...state.player, points: newPoints } : null
            }));
          }
        });
        break;
      }
        
      case 'PURCHASE_AVATAR':
        set(state => ({
          player: state.player 
            ? { 
                ...state.player, 
                points: state.player.points - action.payload.price,
                purchasedAvatars: [...state.player.purchasedAvatars, action.payload.avatarId],
                avatarId: action.payload.avatarId
              } 
            : null
        }));
        break;
        
      // ========== لعبة الاختيارات ==========
      case 'ANSWER': {
        const { choicesQuestion, currentGameScore, totalQuestions, answers, focusQuestions } = get();
        if (choicesQuestion) {
          const isCorrect = action.payload === choicesQuestion.correctAnswer;
          const questionKey = `${choicesQuestion.num1}-${choicesQuestion.num2}`;
          
          // إذا أخطأ، أضف السؤال لقائمة التركيز
          let newFocusQuestions = focusQuestions;
          if (!isCorrect) {
            newFocusQuestions = new Set(focusQuestions);
            newFocusQuestions.add(questionKey);
          } else {
            // إذا أجاب صح، أزل من قائمة التركيز
            newFocusQuestions = new Set(focusQuestions);
            newFocusQuestions.delete(questionKey);
          }
          
          const newAnswer = {
            question: `${choicesQuestion.num1} × ${choicesQuestion.num2}`,
            correctAnswer: choicesQuestion.correctAnswer,
            userAnswer: action.payload,
            isCorrect,
            timestamp: Date.now()
          };
          
          set({
            hasAnswered: true,
            selectedAnswer: action.payload,
            isCorrect,
            currentGameScore: isCorrect ? currentGameScore + 1 : currentGameScore,
            totalQuestions: totalQuestions + 1,
            answers: [...answers, newAnswer],
            focusQuestions: newFocusQuestions
          });
          
          if (isCorrect) {
            get().dispatch({ type: 'ADD_POINTS', payload: 0 });
          }
        }
        break;
      }
        
      case 'GENERATE_QUESTION': {
        const { selectedTable, selectedGame, usedQuestions, focusQuestions, lastQuestion } = get();
        if (selectedTable) {
          if (selectedGame === 'choices') {
            const { question, questionKey } = generateChoicesQuestion(
              selectedTable, 
              usedQuestions, 
              focusQuestions, 
              lastQuestion
            );
            const newUsedQuestions = new Set(usedQuestions);
            newUsedQuestions.add(questionKey);
            
            set({
              choicesQuestion: question,
              hasAnswered: false,
              selectedAnswer: null,
              isCorrect: null,
              lastQuestion: questionKey,
              usedQuestions: newUsedQuestions
            });
          } else if (selectedGame === 'true-false') {
            const { question, questionKey } = generateTrueFalseQuestion(
              selectedTable, 
              usedQuestions, 
              focusQuestions, 
              lastQuestion
            );
            const newUsedQuestions = new Set(usedQuestions);
            newUsedQuestions.add(questionKey);
            
            set({
              trueFalseQuestion: question,
              hasAnswered: false,
              selectedAnswer: null,
              isCorrect: null,
              lastQuestion: questionKey,
              usedQuestions: newUsedQuestions
            });
          }
        }
        break;
      }
        
      case 'NEXT_QUESTION':
        get().dispatch({ type: 'GENERATE_QUESTION' });
        break;
        
      // ========== لعبة التوصيل ==========
      case 'SELECT_MATCHING_QUESTION': {
        const { matchingQuestion } = get();
        if (matchingQuestion) {
          set({
            matchingQuestion: {
              ...matchingQuestion,
              selectedQuestion: action.payload
            }
          });
        }
        break;
      }
        
      case 'SELECT_MATCHING_ANSWER': {
        const { matchingQuestion, currentGameScore, totalQuestions, answers } = get();
        if (matchingQuestion && matchingQuestion.selectedQuestion) {
          const selectedPair = matchingQuestion.pairs.find(p => p.question === matchingQuestion.selectedQuestion);
          
          if (selectedPair && selectedPair.answer === action.payload && !selectedPair.matched) {
            const newPairs = matchingQuestion.pairs.map(p => 
              p.question === matchingQuestion.selectedQuestion ? { ...p, matched: true } : p
            );
            
            const newAnswer = {
              question: matchingQuestion.selectedQuestion,
              correctAnswer: selectedPair.answer,
              userAnswer: action.payload,
              isCorrect: true,
              timestamp: Date.now()
            };
            
            const newMatchedCount = matchingQuestion.matchedCount + 1;
            
            get().dispatch({ type: 'ADD_POINTS', payload: 0 });
            
            if (newMatchedCount === 5) {
              set({
                matchingQuestion: {
                  ...matchingQuestion,
                  pairs: newPairs,
                  selectedQuestion: null,
                  selectedAnswer: null,
                  matchedCount: newMatchedCount
                },
                currentGameScore: currentGameScore + 1,
                totalQuestions: totalQuestions + 1,
                answers: [...answers, newAnswer]
              });
              
              setTimeout(() => {
                get().dispatch({ type: 'NEXT_MATCHING_ROUND' });
              }, 1000);
            } else {
              set({
                matchingQuestion: {
                  ...matchingQuestion,
                  pairs: newPairs,
                  selectedQuestion: null,
                  selectedAnswer: null,
                  matchedCount: newMatchedCount
                },
                currentGameScore: currentGameScore + 1,
                totalQuestions: totalQuestions + 1,
                answers: [...answers, newAnswer]
              });
            }
          } else {
            set({
              matchingQuestion: {
                ...matchingQuestion,
                selectedQuestion: null
              }
            });
          }
        }
        break;
      }
        
      case 'NEXT_MATCHING_ROUND': {
        const { matchingRound, selectedTable } = get();
        if (matchingRound < 5 && selectedTable) {
          set({
            matchingQuestion: generateMatchingQuestion(selectedTable),
            matchingRound: matchingRound + 1
          });
        } else {
          set({ currentScreen: 'results' });
        }
        break;
      }
        
      // ========== لعبة الصح والخطأ ==========
      case 'ANSWER_TRUE_FALSE': {
        const { trueFalseQuestion, currentGameScore, totalQuestions, answers, focusQuestions } = get();
        if (trueFalseQuestion) {
          const isCorrect = action.payload === trueFalseQuestion.isCorrect;
          const questionKey = `${trueFalseQuestion.num1}-${trueFalseQuestion.num2}`;
          
          // إذا أخطأ، أضف السؤال لقائمة التركيز
          let newFocusQuestions = focusQuestions;
          if (!isCorrect) {
            newFocusQuestions = new Set(focusQuestions);
            newFocusQuestions.add(questionKey);
          } else {
            newFocusQuestions = new Set(focusQuestions);
            newFocusQuestions.delete(questionKey);
          }
          
          const newAnswer = {
            question: `${trueFalseQuestion.num1} × ${trueFalseQuestion.num2} = ${trueFalseQuestion.displayedAnswer}`,
            correctAnswer: trueFalseQuestion.num1 * trueFalseQuestion.num2,
            userAnswer: action.payload ? 1 : 0,
            isCorrect,
            timestamp: Date.now()
          };
          
          set({
            hasAnswered: true,
            selectedAnswer: action.payload ? 1 : 0,
            isCorrect,
            currentGameScore: isCorrect ? currentGameScore + 1 : currentGameScore,
            totalQuestions: totalQuestions + 1,
            answers: [...answers, newAnswer],
            focusQuestions: newFocusQuestions
          });
          
          if (isCorrect) {
            get().dispatch({ type: 'ADD_POINTS', payload: 0 });
          }
        }
        break;
      }
        
      // ========== إنهاء اللعبة ==========
      case 'END_GAME':
        set(state => ({ 
          currentScreen: 'results',
          screenHistory: [...state.screenHistory, state.currentScreen]
        }));
        break;
        
      case 'RESTART': {
        const { selectedTable, selectedGame, screenHistory } = get();
        if (selectedTable && selectedGame) {
          // إزالة results من الـ history
          const newHistory = screenHistory.filter(s => s !== 'results');
          
          let newState: Partial<GameState> = {
            currentScreen: 'game',
            currentGameScore: 0,
            totalQuestions: 0,
            answers: [],
            hasAnswered: false,
            selectedAnswer: null,
            isCorrect: null,
            usedQuestions: new Set<string>(),
            focusQuestions: new Set<string>(),
            lastQuestion: null,
            screenHistory: newHistory
          };
          
          if (selectedGame === 'choices') {
            const { question, questionKey } = generateChoicesQuestion(
              selectedTable, 
              new Set(), 
              new Set(), 
              null
            );
            newState.choicesQuestion = question;
            newState.lastQuestion = questionKey;
            newState.usedQuestions = new Set([questionKey]);
          } else if (selectedGame === 'matching') {
            newState.matchingQuestion = generateMatchingQuestion(selectedTable);
            newState.matchingRound = 1;
          } else if (selectedGame === 'true-false') {
            const { question, questionKey } = generateTrueFalseQuestion(
              selectedTable, 
              new Set(), 
              new Set(), 
              null
            );
            newState.trueFalseQuestion = question;
            newState.lastQuestion = questionKey;
            newState.usedQuestions = new Set([questionKey]);
          }
          
          set(newState);
        }
        break;
      }
        
      // ========== إعادة تعيين كاملة ==========
      case 'RESET_STORE':
        set({
          ...initialState,
          player: null,
          isLoading: false
        });
        break;
    }
  }
}));
