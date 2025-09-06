import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Question, 
  AnswerResult, 
  Statistics, 
  UserSettings, 
  PracticeMode, 
  QuestionType 
} from '../types/kana';
import { getRandomCharacter } from '../data/kanaData';

interface KanaStore {
  // 用户设置
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // 当前问题
  currentQuestion: Question | null;
  generateNewQuestion: () => void;
  
  // 答题历史
  answerHistory: AnswerResult[];
  submitAnswer: (answer: string) => void;
  
  // 统计信息
  statistics: Statistics;
  resetStatistics: () => void;
  
  // 会话状态
  sessionStartTime: number;
  sessionQuestions: number;
  sessionCorrect: number;
  
  // UI状态
  showAnswer: boolean;
  setShowAnswer: (show: boolean) => void;
  
  // 初始化
  initializeSession: () => void;
}

const defaultSettings: UserSettings = {
  practiceMode: 'hiragana',
  questionType: 'kana-to-romaji',
  autoNext: true,
  timeLimit: 0,
};

const defaultStatistics: Statistics = {
  totalQuestions: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  accuracy: 0,
  averageResponseTime: 0,
  characterStats: {},
};

const generateQuestion = (
  mode: PracticeMode, 
  questionType: QuestionType
): Question => {
  const character = getRandomCharacter(mode);
  const id = `${Date.now()}-${Math.random()}`;
  
  let displayText: string;
  let correctAnswers: string[];
  
  switch (questionType) {
    case 'kana-to-romaji':
      if (mode === 'hiragana') {
        displayText = character.hiragana;
      } else if (mode === 'katakana') {
        displayText = character.katakana;
      } else {
        // mixed mode
        displayText = Math.random() > 0.5 ? character.hiragana : character.katakana;
      }
      correctAnswers = [character.romaji];
      break;
      
    case 'kana-to-pronunciation':
      if (mode === 'hiragana') {
        displayText = character.hiragana;
      } else if (mode === 'katakana') {
        displayText = character.katakana;
      } else {
        displayText = Math.random() > 0.5 ? character.hiragana : character.katakana;
      }
      correctAnswers = [character.pronunciation];
      break;
      
    case 'romaji-to-kana':
      displayText = character.romaji;
      if (mode === 'hiragana') {
        correctAnswers = [character.hiragana];
      } else if (mode === 'katakana') {
        correctAnswers = [character.katakana];
      } else {
        correctAnswers = [character.hiragana, character.katakana];
      }
      break;
      
    default:
      displayText = character.hiragana;
      correctAnswers = [character.romaji];
  }
  
  return {
    id,
    character,
    questionType,
    mode,
    displayText,
    correctAnswers,
  };
};

export const useKanaStore = create<KanaStore>()(
  persist(
    (set, get) => ({
      // 默认状态
      settings: defaultSettings,
      currentQuestion: null,
      answerHistory: [],
      statistics: defaultStatistics,
      sessionStartTime: Date.now(),
      sessionQuestions: 0,
      sessionCorrect: 0,
      showAnswer: false,
      
      // 更新设置
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
        // 设置更新后重新生成问题
        get().generateNewQuestion();
      },
      
      // 生成新问题
      generateNewQuestion: () => {
        const { settings } = get();
        const question = generateQuestion(settings.practiceMode, settings.questionType);
        set({ currentQuestion: question, showAnswer: false });
      },
      
      // 提交答案
      submitAnswer: (userAnswer: string) => {
        const state = get();
        const { currentQuestion, statistics, answerHistory } = state;
        
        if (!currentQuestion) return;
        
        const isCorrect = currentQuestion.correctAnswers.some(
          answer => answer.toLowerCase() === userAnswer.toLowerCase().trim()
        );
        
        const result: AnswerResult = {
          questionId: currentQuestion.id,
          userAnswer,
          correctAnswer: currentQuestion.correctAnswers[0],
          isCorrect,
          timestamp: Date.now(),
          character: currentQuestion.character,
        };
        
        // 更新统计信息
        const characterKey = currentQuestion.character.hiragana;
        const newCharacterStats = { ...statistics.characterStats };
        
        if (!newCharacterStats[characterKey]) {
          newCharacterStats[characterKey] = {
            attempts: 0,
            correct: 0,
            accuracy: 0,
            lastAttempt: 0,
          };
        }
        
        newCharacterStats[characterKey].attempts += 1;
        if (isCorrect) {
          newCharacterStats[characterKey].correct += 1;
        }
        newCharacterStats[characterKey].accuracy = 
          newCharacterStats[characterKey].correct / newCharacterStats[characterKey].attempts;
        newCharacterStats[characterKey].lastAttempt = Date.now();
        
        const newStatistics: Statistics = {
          totalQuestions: statistics.totalQuestions + 1,
          correctAnswers: statistics.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: statistics.incorrectAnswers + (isCorrect ? 0 : 1),
          accuracy: ((statistics.correctAnswers + (isCorrect ? 1 : 0)) / (statistics.totalQuestions + 1)) * 100,
          averageResponseTime: statistics.averageResponseTime, // TODO: 实现响应时间计算
          characterStats: newCharacterStats,
        };
        
        set({
          answerHistory: [...answerHistory, result],
          statistics: newStatistics,
          sessionQuestions: state.sessionQuestions + 1,
          sessionCorrect: state.sessionCorrect + (isCorrect ? 1 : 0),
          showAnswer: true,
        });
        
        // 自动进入下一题
        if (state.settings.autoNext) {
          setTimeout(() => {
            get().generateNewQuestion();
          }, 1500);
        }
      },
      
      // 重置统计
      resetStatistics: () => {
        set({
          statistics: defaultStatistics,
          answerHistory: [],
          sessionQuestions: 0,
          sessionCorrect: 0,
          sessionStartTime: Date.now(),
        });
      },
      
      // 显示答案状态
      setShowAnswer: (show) => {
        set({ showAnswer: show });
      },
      
      // 初始化会话
      initializeSession: () => {
        set({
          sessionStartTime: Date.now(),
          sessionQuestions: 0,
          sessionCorrect: 0,
        });
        get().generateNewQuestion();
      },
    }),
    {
      name: 'kana-store',
      // 只持久化设置和统计信息，不持久化会话状态
      partialize: (state) => ({
        settings: state.settings,
        statistics: state.statistics,
        answerHistory: state.answerHistory.slice(-100), // 只保留最近100条记录
      }),
    }
  )
);