import { describe, it, expect } from 'vitest';
import {
  gradeAnswer,
  isAnswerCorrect,
  isAnswered,
  computeAttemptScore,
  percentage,
  isPassing,
  performanceBreakdown,
  matchesTextAnswer,
  shuffle,
} from '../scoring';
import type { Question, StudentAnswer, Attempt, Assessment, Option } from '../../types';

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'a1',
    kind: 'quiz',
    subjectId: 's_cyber',
    topicIds: ['t_crypto'],
    title: 'T',
    status: 'published',
    author: 'Demo Teacher',
    createdAt: 0,
    updatedAt: 0,
    questionIds: [],
    attemptsCount: 0,
    avgScore: null,
    settings: { passingScore: 60 },
    ...overrides,
  } as Assessment;
}

function makeQuestion(overrides: Partial<Question> = {}): Question {
  const options: Option[] = [
    { id: 'a', text: 'Alpha' },
    { id: 'b', text: 'Bravo' },
    { id: 'c', text: 'Charlie' },
  ];
  return {
    id: 'q1',
    type: 'multiple_choice',
    text: 'Which is correct?',
    options,
    correctAnswer: ['a'],
    subjectId: 's_cyber',
    topicId: 't_auth',
    difficulty: 'easy',
    points: 5,
    estimatedSeconds: 30,
    tags: [],
    author: 'Demo Teacher',
    status: 'active',
    createdAt: 0,
    updatedAt: 0,
    usageCount: 0,
    ...overrides,
  };
}

function makeAnswer(overrides: Partial<StudentAnswer> = {}): StudentAnswer {
  return {
    questionId: 'q1',
    selectedOptionIds: ['a'],
    isCorrect: true,
    gainedPoints: 5,
    isMarkedForReview: false,
    ...overrides,
  };
}

describe('gradeAnswer', () => {
  it('awards points for an exact multiple-choice match', () => {
    expect(gradeAnswer(makeQuestion(), makeAnswer())).toBe(5);
  });

  it('awards zero for a wrong multiple-choice answer', () => {
    expect(gradeAnswer(makeQuestion(), makeAnswer({ selectedOptionIds: ['b'] }))).toBe(0);
  });

  it('awards zero when extra options are selected (multi-select exact set match)', () => {
    const q = makeQuestion({ type: 'multiple_select', correctAnswer: ['a', 'b'] });
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: ['a', 'b', 'c'] }))).toBe(0);
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: ['a', 'b'] }))).toBe(5);
  });

  it('grades true_false by single selection', () => {
    const q = makeQuestion({ type: 'true_false', options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], correctAnswer: ['false'] });
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: ['false'] }))).toBe(5);
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: ['true'] }))).toBe(0);
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: [] }))).toBe(0);
  });

  it('grades short_answer case-insensitively after trimming', () => {
    const q = makeQuestion({ type: 'short_answer', options: [], correctAnswer: ['least privilege'] });
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: [], textAnswer: '  LEAST PRIVILEGE  ' }))).toBe(5);
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: [], textAnswer: 'root' }))).toBe(0);
  });

  it('accepts any non-empty essay answer in demo mode', () => {
    const q = makeQuestion({ type: 'essay', options: [], correctAnswer: [] });
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: [], textAnswer: 'My reasoning...' }))).toBe(5);
    expect(gradeAnswer(q, makeAnswer({ selectedOptionIds: [], textAnswer: '   ' }))).toBe(0);
  });
});

describe('isAnswered / isAnswerCorrect', () => {
  it('treats text questions as answered only when text is non-empty', () => {
    const q = makeQuestion({ type: 'short_answer', options: [], correctAnswer: ['x'] });
    expect(isAnswered(q, makeAnswer({ selectedOptionIds: [], textAnswer: 'x' }))).toBe(true);
    expect(isAnswered(q, makeAnswer({ selectedOptionIds: [], textAnswer: '' }))).toBe(false);
    expect(isAnswered(q, undefined)).toBe(false);
  });

  it('delegates correctness to gradeAnswer', () => {
    expect(isAnswerCorrect(makeQuestion(), makeAnswer())).toBe(true);
    expect(isAnswerCorrect(makeQuestion(), makeAnswer({ selectedOptionIds: ['c'] }))).toBe(false);
  });
});

describe('computeAttemptScore', () => {
  it('counts correct, incorrect, and unanswered questions', () => {
    const qs = [makeQuestion(), makeQuestion({ id: 'q2' }), makeQuestion({ id: 'q3' })];
    const answers = [
      makeAnswer(),
      makeAnswer({ questionId: 'q2', selectedOptionIds: ['b'] }),
      // q3 unanswered
    ];
    const result = computeAttemptScore(qs, answers);
    expect(result.score).toBe(5);
    expect(result.maxScore).toBe(15);
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.unansweredCount).toBe(1);
  });
});

describe('percentage & isPassing', () => {
  it('rounds percentages and guards against zero max', () => {
    expect(percentage(7, 20)).toBe(35);
    expect(percentage(0, 0)).toBe(0);
  });

  it('passes when score meets the passing threshold', () => {
    const attempt: Attempt = { id: 'at1', assessmentId: 'a1', kind: 'quiz', studentId: 'me', status: 'submitted', answers: [], startedAt: 0, submittedAt: 0, timeSpentSeconds: 10, score: 70, maxScore: 100 };
    const assessment = makeAssessment();
    expect(isPassing(attempt, assessment)).toBe(true);
    expect(isPassing({ ...attempt, score: 59 }, assessment)).toBe(false);
  });
});

describe('performanceBreakdown', () => {
  it('aggregates by topic and difficulty', () => {
    const qs = [
      makeQuestion({ id: 'q1', topicId: 't_a', difficulty: 'easy' }),
      makeQuestion({ id: 'q2', topicId: 't_a', difficulty: 'hard' }),
      makeQuestion({ id: 'q3', topicId: 't_b', difficulty: 'hard' }),
    ];
    const answers = [
      makeAnswer(),
      makeAnswer({ questionId: 'q2', selectedOptionIds: ['b'] }),
      makeAnswer({ questionId: 'q3', selectedOptionIds: [] }), // unanswered
    ];
    const bd = performanceBreakdown(qs, answers, (id) => `Topic ${id}`);
    const topicA = bd.byTopic.find((t) => t.topicId === 't_a');
    expect(topicA).toMatchObject({ total: 2, correct: 1, pct: 50, topicName: 'Topic t_a' });
    const topicB = bd.byTopic.find((t) => t.topicId === 't_b');
    expect(topicB).toMatchObject({ total: 0, correct: 0, pct: 0 });
    const hard = bd.byDifficulty.find((d) => d.difficulty === 'hard');
    expect(hard).toMatchObject({ total: 1, correct: 0 });
  });
});

describe('matchesTextAnswer', () => {
  it('matches accepted answers ignoring case and whitespace', () => {
    const q = makeQuestion({ type: 'short_answer', options: [], correctAnswer: ['Least Privilege'] });
    expect(matchesTextAnswer(q, 'least privilege')).toBe(true);
    expect(matchesTextAnswer(q, 'something else')).toBe(false);
  });
});

describe('shuffle', () => {
  it('returns a permutation preserving elements and length', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort()).toEqual([...input].sort());
  });
});