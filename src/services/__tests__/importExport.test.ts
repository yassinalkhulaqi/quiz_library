import { describe, it, expect } from 'vitest';
import {
  parseImport,
  parseJsonImport,
  parseCsvImport,
  importRowsToQuestions,
  findDuplicates,
} from '../importExport';
import type { Question } from '../../types';

function baseQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: 'multiple_choice',
    text: 'What is the capital of France?',
    options: [{ id: 'a', text: 'Paris' }, { id: 'b', text: 'Rome' }],
    correctAnswer: ['a'],
    subjectId: 's_cyber',
    topicId: 't_crypto',
    difficulty: 'easy',
    points: 5,
    estimatedSeconds: 30,
    tags: [],
    author: 'Test',
    status: 'active',
    createdAt: 0,
    updatedAt: 0,
    usageCount: 0,
    ...overrides,
  };
}

describe('parseJsonImport', () => {
  it('parses a valid array of questions', () => {
    const { rows, errors } = parseJsonImport(
      JSON.stringify([{ type: 'multiple_choice', text: 'Q?', options: ['A', 'B'], correctAnswer: ['A'] }])
    );
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ type: 'multiple_choice', text: 'Q?', options: ['A', 'B'] });
  });

  it('reports invalid JSON', () => {
    const { errors } = parseJsonImport('{ not json');
    expect(errors).toContain('The file is not valid JSON.');
  });

  it('rejects a non-array root', () => {
    const { errors } = parseJsonImport('{"a":1}');
    expect(errors).toContain('JSON root must be an array of questions.');
  });

  it('flags rows with missing text or unknown types', () => {
    const { errors } = parseJsonImport(
      JSON.stringify([{ type: 'bogus', text: 'X' }, { type: 'multiple_choice', text: '' }])
    );
    expect(errors.length).toBe(2);
  });
});

describe('parseCsvImport', () => {
  it('parses a header plus question rows', () => {
    const csv = 'type,text,options,correct,difficulty\nmultiple_choice,What is 2+2?,3|4,4,easy';
    const { rows, errors } = parseCsvImport(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ text: 'What is 2+2?', options: ['3', '4'], correctAnswer: ['4'], difficulty: 'easy' });
  });

  it('returns an error when only a header exists', () => {
    const { errors } = parseCsvImport('type,text\n');
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('parseImport', () => {
  it('dispatches by format', () => {
    expect(parseImport('json', '[{"text":"Q","options":["A","B"],"correctAnswer":["A"]}]').rows).toHaveLength(1);
    expect(parseImport('csv', 'type,text\nmultiple_choice,Hello').rows).toHaveLength(1);
  });
});

describe('importRowsToQuestions', () => {
  it('maps import rows to full Question objects', () => {
    const { rows } = parseJsonImport(
      JSON.stringify([{ type: 'true_false', text: 'Water boils at 100C.', correctAnswer: 'true' }])
    );
    const qs = importRowsToQuestions(rows);
    expect(qs).toHaveLength(1);
    expect(qs[0]).toMatchObject({
      type: 'true_false',
      text: 'Water boils at 100C.',
      correctAnswer: ['true'],
      points: 5,
      status: 'active',
    });
    expect(qs[0].id).toMatch(/^q/);
  });
});

describe('findDuplicates', () => {
  it('detects questions whose text already exists (case-insensitive)', () => {
    const existing = [baseQuestion({ text: 'What is the capital of France?' })];
    const { rows } = parseJsonImport(
      JSON.stringify([{ type: 'multiple_choice', text: 'what is the capital of france?', options: ['A', 'B'], correctAnswer: ['A'] }])
    );
    const dups = findDuplicates(rows, existing);
    expect(dups).toHaveLength(1);
  });

  it('returns an empty list when there are no duplicates', () => {
    const existing = [baseQuestion()];
    const { rows } = parseJsonImport(
      JSON.stringify([{ type: 'multiple_choice', text: 'Brand new question', options: ['A', 'B'], correctAnswer: ['A'] }])
    );
    expect(findDuplicates(rows, existing)).toEqual([]);
  });
});