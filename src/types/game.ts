// أنواع الألعاب المتاحة
export type GameType = 'choices' | 'matching' | 'true-false';

// حالة اللعبة
export type GameScreen = 'home' | 'table-select' | 'game' | 'results' | 'profile' | 'admin';

// سجل الإجابة
export interface AnswerRecord {
  question: string;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  timestamp: number;
}

// بيانات اللاعب
export interface PlayerData {
  id: string;
  name: string;
  avatarId: number;
  points: number;
  purchasedAvatars: number[];
  isAdmin?: boolean;
}

// سؤال لعبة الاختيارات
export interface ChoicesQuestion {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

// سؤال لعبة التوصيل
export interface MatchingQuestion {
  pairs: { question: string; answer: number; matched: boolean }[];
  selectedQuestion: string | null;
  selectedAnswer: number | null;
  matchedCount: number;
}

// سؤال لعبة الصح والخطأ
export interface TrueFalseQuestion {
  num1: number;
  num2: number;
  displayedAnswer: number;
  isCorrect: boolean;
}

// حالة اللعبة الكاملة
export interface GameState {
  // الشاشة الحالية
  currentScreen: GameScreen;
  
  // تاريخ الصفحات للرجوع
  screenHistory: GameScreen[];
  
  // نوع اللعبة المختار
  selectedGame: GameType | null;
  
  // الجدول المختار (2-9)
  selectedTable: number | null;
  
  // النقاط في اللعبة الحالية
  currentGameScore: number;
  
  // عدد الأسئلة
  totalQuestions: number;
  
  // سجل الإجابات
  answers: AnswerRecord[];
  
  // ========== لعبة الاختيارات ==========
  choicesQuestion: ChoicesQuestion | null;
  hasAnswered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  
  // ========== لعبة التوصيل ==========
  matchingQuestion: MatchingQuestion | null;
  matchingRound: number;
  
  // ========== لعبة الصح والخطأ ==========
  trueFalseQuestion: TrueFalseQuestion | null;
  
  // ========== بيانات اللاعب ==========
  player: PlayerData | null;
  isLoading: boolean;
  
  // ========== تتبع الأسئلة (للتوزيع العادل) ==========
  // الأسئلة التي تم استخدامها في اللعبة الحالية
  usedQuestions: Set<string>;
  // الأسئلة التي أخطأ فيها اللاعب (للتركيز عليها)
  focusQuestions: Set<string>;
  // آخر سؤال تم عرضه (لمنع التكرار المتتالي)
  lastQuestion: string | null;
}

// إجراءات اللعبة
export type GameAction =
  | { type: 'SELECT_GAME'; payload: GameType }
  | { type: 'SELECT_TABLE'; payload: number }
  | { type: 'START_GAME'; payload: { gameType: GameType; tableNumber: number } }
  | { type: 'GENERATE_QUESTION' }
  | { type: 'ANSWER'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'RESTART' }
  | { type: 'GO_HOME' }
  | { type: 'GO_TO_PROFILE' }
  | { type: 'GO_TO_ADMIN' }
  | { type: 'GO_BACK' }
  | { type: 'SET_PLAYER'; payload: PlayerData }
  | { type: 'UPDATE_PLAYER_DATA'; payload: Partial<PlayerData> & { purchasedAvatars?: number[] } }
  | { type: 'UPDATE_PLAYER_NAME'; payload: string }
  | { type: 'UPDATE_PLAYER_AVATAR'; payload: number }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'PURCHASE_AVATAR'; payload: { avatarId: number; price: number } }
  // لعبة التوصيل
  | { type: 'SELECT_MATCHING_QUESTION'; payload: string }
  | { type: 'SELECT_MATCHING_ANSWER'; payload: number }
  | { type: 'NEXT_MATCHING_ROUND' }
  // لعبة الصح والخطأ
  | { type: 'ANSWER_TRUE_FALSE'; payload: boolean }
  // إعادة تعيين كاملة
  | { type: 'RESET_STORE' };
