import type { Option, Question, StudentAnswer, Attempt, Assessment } from '../types';

/**
 * Evaluates a student answer against a question.
 * Returns the gained points (0..question.points).
 */
export function gradeAnswer(question: Question, answer: StudentAnswer): number {
  if (answer.textAnswer !== undefined && question.type === 'essay') {
    // Essay questions are manually graded in a real product. For the demo
    // we treat a non-empty answer as correct so the flow stays interactive.
    return answer.textAnswer.trim().length > 0 ? question.points : 0;
  }

  const selected = new Set(answer.selectedOptionIds);
  const correct = new Set(question.correctAnswer);

  switch (question.type) {
    case 'true_false':
      return selected.size === 1 && correct.has([...selected][0]) ? question.points : 0;
    case 'short_answer':
    case 'fill_blank': {
      const text = (answer.textAnswer ?? '').trim().toLowerCase();
      const accepted = question.correctAnswer.map((id) => id.trim().toLowerCase());
      return accepted.includes(text) ? question.points : 0;
    }
    default:
      // exact set match for single & multi select
      if (selected.size !== correct.size) return 0;
      for (const s of selected) {
        if (!correct.has(s)) return 0;
      }
      return question.points;
  }
}

export function isAnswerCorrect(question: Question, answer: StudentAnswer): boolean {
  return gradeAnswer(question, answer) > 0;
}

export function isAnswered(question: Question, answer: StudentAnswer | undefined): boolean {
  if (!answer) return false;
  if (question.type === 'short_answer' || question.type === 'fill_blank' || question.type === 'essay') {
    return (answer.textAnswer ?? '').trim().length > 0;
  }
  return answer.selectedOptionIds.length > 0;
}

export function computeAttemptScore(questions: Question[], answers: StudentAnswer[]): {
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
} {
  let score = 0;
  let maxScore = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    maxScore += question.points;
    if (!isAnswered(question, answer)) {
      unanswered += 1;
      continue;
    }
    if (gradeAnswer(question, answer!) > 0) {
      correct += 1;
      score += question.points;
    } else {
      incorrect += 1;
    }
  }

  return { score, maxScore, correctCount: correct, incorrectCount: incorrect, unansweredCount: unanswered };
}

export function percentage(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function isPassing(attempt: Attempt, assessment: Assessment): boolean {
  const pct = percentage(attempt.score, attempt.maxScore);
  return pct >= assessment.settings.passingScore;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectId: string;
  correct: number;
  total: number;
  pct: number;
}

export interface DifficultyPerformance {
  difficulty: string;
  correct: number;
  total: number;
  pct: number;
}

/**
 * Aggregates per-topic and per-difficulty performance for a set of answered questions.
 */
export function performanceBreakdown(
  questions: Question[],
  answers: StudentAnswer[],
  topicNameOf: (topicId: string) => string
): { byTopic: TopicPerformance[]; byDifficulty: DifficultyPerformance[] } {
  const topicMap = new Map<string, { correct: number; total: number }>();
  const difficultyMap = new Map<string, { correct: number; total: number }>();

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const correct = answer ? gradeAnswer(question, answer) > 0 : false;
    const answered = isAnswered(question, answer);

    const t = topicMap.get(question.topicId) ?? { correct: 0, total: 0 };
    if (answered) t.total += 1;
    if (answered && correct) t.correct += 1;
    topicMap.set(question.topicId, t);

    const d = difficultyMap.get(question.difficulty) ?? { correct: 0, total: 0 };
    if (answered) d.total += 1;
    if (answered && correct) d.correct += 1;
    difficultyMap.set(question.difficulty, d);
  }

  const byTopic = [...topicMap.entries()]
    .map(([topicId, v]) => ({
      topicId,
      topicName: topicNameOf(topicId),
      subjectId: '',
      correct: v.correct,
      total: v.total,
      pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

  const byDifficulty = [...difficultyMap.entries()]
    .map(([difficulty, v]) => ({
      difficulty,
      correct: v.correct,
      total: v.total,
      pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

  return { byTopic, byDifficulty };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Returns true if a freshly typed text answer is accepted by a question. */
export function matchesTextAnswer(question: Question, text: string): boolean {
  const t = text.trim().toLowerCase();
  return question.correctAnswer.some((id) => id.trim().toLowerCase() === t);
}

export function toOptionIds(options: Option[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.id, o.text]));
}

export { gradeAnswer as gradeStudentAnswer };