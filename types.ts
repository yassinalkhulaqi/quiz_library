export type Tool = 'quiz' | 'translate' | 'summarize' | 'mindmap' | 'chat';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
}

export interface QuestionOption {
    text_en: string;
    text_ar: string;
}

export interface QuizQuestion {
    type: QuestionType;
    question_en: string;
    question_ar: string;
    options: QuestionOption[];
    answer_en: string;
    answer_ar: string;
    explanation_en: string;
    explanation_ar: string;
}

export interface UserAnswer {
    question_en: string;
    selected_answer_en: string;
    correct_answer_en: string;
    is_correct: boolean;
}

export interface QuizHistoryItem {
    id: string;
    timestamp: number;
    quizQuestions: QuizQuestion[];
    userAnswers: UserAnswer[];
    fileName: string;
}

export interface MindMapNode {
  title: string;
  summary?: string;
  children: MindMapNode[];
  language?: 'ar' | 'en'; // Only for the root node
}

export interface Flashcard {
  front_en: string;
  front_ar: string;
  back_en: string;
  back_ar: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
