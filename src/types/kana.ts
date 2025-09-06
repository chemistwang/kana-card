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
}

export interface AnswerResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  character: KanaCharacter;
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
  }>;
}

export interface UserSettings {
  practiceMode: PracticeMode;
  questionType: QuestionType;
  autoNext: boolean;
  timeLimit: number; // seconds, 0 means no limit
}