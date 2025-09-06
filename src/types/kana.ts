export interface KanaCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  pronunciation: string; // 中文读音
}

export interface KanaRow {
  rowName: string;
  characters: KanaCharacter[];
}

export type PracticeMode = 'hiragana' | 'katakana' | 'mixed';

export type QuestionType = 'kana-to-romaji' | 'kana-to-pronunciation' | 'romaji-to-kana';

export interface Question {
  id: string;
  character: KanaCharacter;
  questionType: QuestionType;
  mode: PracticeMode;
  displayText: string;
  correctAnswers: string[];
  startTime: number;
}

export interface AnswerResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  character: KanaCharacter;
  responseTime: number; // 响应时间（毫秒）
}

export interface Statistics {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  characterStats: Record<string, {
    attempts: number;
    correct: number;
    accuracy: number;
    lastAttempt: number;
    averageResponseTime: number; // 平均响应时间（毫秒）
    fastestResponseTime: number; // 最快响应时间（毫秒）
    slowestResponseTime: number; // 最慢响应时间（毫秒）
    totalResponseTime: number;   // 总响应时间（毫秒）
  }>;
}

export interface UserSettings {
  practiceMode: PracticeMode;
  questionType: QuestionType;
  autoNext: boolean;
  timeLimit: number; // seconds, 0 means no limit
}