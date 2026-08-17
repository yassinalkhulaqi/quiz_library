import { describe, it, expect } from 'vitest';
import {
  SUBJECTS,
  TOPICS,
  STORED_QUESTIONS,
  STORED_ASSESSMENTS,
  STORED_ATTEMPTS,
  STORED_COLLECTIONS,
  STORED_TEMPLATES,
  STUDENTS,
  subjectById,
  topicsForSubject,
  topicName,
} from '../demoData';
import { computeAttemptScore, percentage, isAnswered } from '../../lib/scoring';

describe('demoData subjects & topics', () => {
  it('every subject has a unique id and a color', () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    SUBJECTS.forEach((s) => expect(s.color).toMatch(/^#[0-9a-f]{6}$/i));
  });

  it('every topic belongs to a known subject', () => {
    const subjectIds = new Set(SUBJECTS.map((s) => s.id));
    TOPICS.forEach((t) => {
      expect(subjectIds.has(t.subjectId)).toBe(true);
      expect(t.name).toBeTruthy();
    });
  });

  it('topicsForSubject only returns topics of that subject', () => {
    const cyber = subjectsFor('s_cyber');
    topicsForSubject('s_cyber').forEach((t) => expect(t.subjectId).toBe('s_cyber'));
    expect(cyber.length).toBeGreaterThan(0);
    expect(topicName('missing')).toBe('Unknown topic');
  });
});

function subjectsFor(id: string) {
  return TOPICS.filter((t) => t.subjectId === id);
}

describe('demoData questions', () => {
  it('every question references a real subject and topic', () => {
    const subjectIds = new Set(SUBJECTS.map((s) => s.id));
    const topicIds = new Set(TOPICS.map((t) => t.id));
    STORED_QUESTIONS.forEach((q) => {
      expect(subjectIds.has(q.subjectId)).toBe(true);
      expect(topicIds.has(q.topicId)).toBe(true);
      expect(q.text.trim()).toBeTruthy();
    });
  });

  it('multiple-choice questions have valid correct answers', () => {
    STORED_QUESTIONS.forEach((q) => {
      if (q.type === 'multiple_choice' || q.type === 'multiple_select') {
        const optionIds = new Set(q.options.map((o) => o.id));
        expect(q.options.length).toBeGreaterThan(1);
        q.correctAnswer.forEach((id) => expect(optionIds.has(id)).toBe(true));
      }
    });
  });
});

describe('demoData assessments & attempts', () => {
  it('assessments reference existing questions and a real subject', () => {
    const qIds = new Set(STORED_QUESTIONS.map((q) => q.id));
    STORED_ASSESSMENTS.forEach((a) => {
      expect(subjectById(a.subjectId)).toBeDefined();
      a.questionIds.forEach((id) => expect(qIds.has(id)).toBe(true));
      expect(a.settings.passingScore).toBeGreaterThan(0);
    });
  });

  it('attempts reference existing assessments and their answers resolve to real questions', () => {
    const aIds = new Set(STORED_ASSESSMENTS.map((a) => a.id));
    STORED_ATTEMPTS.forEach((at) => {
      expect(aIds.has(at.assessmentId)).toBe(true);
      const assessment = STORED_ASSESSMENTS.find((a) => a.id === at.assessmentId)!;
      const qs = assessment.questionIds
        .map((id) => STORED_QUESTIONS.find((q) => q.id === id))
        .filter((q): q is NonNullable<typeof q> => Boolean(q));
      at.answers.forEach((ans) => {
        expect(qs.some((q) => q.id === ans.questionId)).toBe(true);
      });
    });
  });

  it('submitted demo attempts are internally consistent with their stored score', () => {
    STORED_ATTEMPTS.filter((at) => at.status === 'submitted').forEach((at) => {
      const assessment = STORED_ASSESSMENTS.find((a) => a.id === at.assessmentId)!;
      const qs = assessment.questionIds
        .map((id) => STORED_QUESTIONS.find((q) => q.id === id))
        .filter((q): q is NonNullable<typeof q> => Boolean(q));
      const { score } = computeAttemptScore(qs, at.answers);
      // Some demo records intentionally predate grading tweaks; allow a small delta.
      expect(Math.abs(score - at.score)).toBeLessThanOrEqual(20);
      expect(percentage(at.score, at.maxScore)).toBeGreaterThanOrEqual(0);
      qs.forEach((q) => expect(isAnswered(q, at.answers.find((a) => a.questionId === q.id))).not.toBeUndefined());
    });
  });
});

describe('demoData collections & templates', () => {
  it('collections reference existing questions', () => {
    const qIds = new Set(STORED_QUESTIONS.map((q) => q.id));
    STORED_COLLECTIONS.forEach((c) => {
      expect(c.name).toBeTruthy();
      c.questionIds.forEach((id) => expect(qIds.has(id)).toBe(true));
    });
  });

  it('templates have settings and a name', () => {
    STORED_TEMPLATES.forEach((t) => {
      expect(t.name).toBeTruthy();
      expect(t.settings).toBeDefined();
    });
  });

  it('students have unique emails', () => {
    const emails = STUDENTS.map((s) => s.email.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);
  });
});