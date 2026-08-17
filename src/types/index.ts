export type Role = 'admin' | 'teacher' | 'student';

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'fill_blank'
  | 'essay';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionStatus = 'active' | 'archived' | 'draft';

export type AssessmentKind = 'quiz' | 'exam';

export type AssessmentStatus = 'draft' | 'published' | 'closed';

export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: Option[];
  /** Option ids that are correct. For true_false use special ids ['true']/['false']. */
  correctAnswer: string[];
  explanation?: string;
  subjectId: string;
  topicId: string;
  difficulty: Difficulty;
  tags: string[];
  points: number;
  estimatedSeconds: number;
  author: string;
  status: QuestionStatus;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  questionIds: string[];
  createdAt: number;
}

export interface Assessment {
  id: string;
  kind: AssessmentKind;
  title: string;
  description?: string;
  subjectId: string;
  topicIds: string[];
  questionIds: string[];
  /** Overrides points per question. */
  settings: AssessmentSettings;
  status: AssessmentStatus;
  author: string;
  createdAt: number;
  updatedAt: number;
  attemptsCount: number;
  avgScore: number | null;
}

export interface AssessmentSettings {
  timeLimitMinutes: number | null;
  maxAttempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showAnswersAfter: boolean;
  showExplanations: boolean;
  allowQuestionNavigation: boolean;
  allowReviewMarking: boolean;
  pointsPerQuestion: number | null;
  availableFrom: number | null;
  availableUntil: number | null;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer?: string;
  isMarkedForReview: boolean;
  isCorrect: boolean;
  gainedPoints: number;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  kind: AssessmentKind;
  studentId: string;
  status: AttemptStatus;
  answers: StudentAnswer[];
  startedAt: number;
  submittedAt: number | null;
  timeSpentSeconds: number;
  score: number;
  maxScore: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  grade: string;
}

export interface NotificationItem {
  id: string;
  type: 'ai' | 'quiz' | 'exam' | 'student' | 'import' | 'export' | 'analytics' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface ActivityItem {
  id: string;
  type: 'ai_generated' | 'quiz_created' | 'exam_created' | 'exam_submitted' | 'question_created' | 'question_updated' | 'import' | 'collection' | 'student_joined' | 'system';
  title: string;
  description: string;
  createdAt: number;
  userId: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  kind: AssessmentKind;
  settings: Partial<AssessmentSettings>;
  questionCount: number;
  icon: string;
}

export interface AiGenerationConfig {
  subjectId: string;
  topicId: string;
  educationLevel: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  count: number;
  language: 'en' | 'ar';
  objectives: string;
  includeExplanations: boolean;
  includeAnswers: boolean;
  randomizeOptions: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: Role;
  organization: string;
  avatarColor: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'ar';
  notificationsEnabled: boolean;
  reduceMotion: boolean;
  aiProvider: 'demo' | 'gemini';
  aiKeyConfigured: boolean;
  defaultDifficulty: Difficulty;
  defaultQuestionType: QuestionType;
  showCorrectAnswersImmediately: boolean;
}

export interface AiGeneratedQuestion {
  raw: Question;
  accepted: boolean;
  edited: boolean;
  index: number;
}

export interface SearchResultGroup<T> {
  label: string;
  items: T[];
}