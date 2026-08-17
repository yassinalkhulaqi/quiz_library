import type { Question, QuestionType } from '../types';
import { uid } from '../lib/utils';
import { SUBJECTS, TOPICS } from '../data/demoData';

export type ImportFormat = 'json' | 'csv';

export interface ImportRow {
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: string[];
  explanation?: string;
  subjectName?: string;
  topicName?: string;
  difficulty: Question['difficulty'];
  tags: string[];
}

export interface ImportResult {
  rows: ImportRow[];
  errors: string[];
  warnings: string[];
}

export interface ParsedImport {
  rows: ImportRow[];
  errors: string[];
}

function normalizeDifficulty(value: string): Question['difficulty'] {
  const v = value.trim().toLowerCase();
  if (v === 'easy' || v === 'hard' || v === 'medium') return v;
  if (v === 'h') return 'hard';
  if (v === 'e') return 'easy';
  if (v === 'm') return 'medium';
  return 'easy';
}

function normalizeType(value: string): QuestionType | null {
  const v = value.trim().toLowerCase().replace(/\s+/g, '_');
  const valid: QuestionType[] = [
    'multiple_choice',
    'multiple_select',
    'true_false',
    'short_answer',
    'fill_blank',
    'essay',
  ];
  const match = valid.find((t) => t === v || t.replace('_', ' ') === v.replace('_', ' '));
  return match ?? null;
}

export function parseJsonImport(text: string): ParsedImport {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { rows: [], errors: ['The file is not valid JSON.'] };
  }
  if (!Array.isArray(data)) {
    return { rows: [], errors: ['JSON root must be an array of questions.'] };
  }
  const rows: ImportRow[] = [];
  data.forEach((raw, i) => {
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`Row ${i + 1}: not an object.`);
      return;
    }
    const o = raw as Record<string, unknown>;
    const type = normalizeType(String(o.type ?? 'multiple_choice'));
    if (!type) {
      errors.push(`Row ${i + 1}: unknown question type "${o.type}".`);
      return;
    }
    const text = String(o.text ?? '').trim();
    if (!text) {
      errors.push(`Row ${i + 1}: missing question text.`);
      return;
    }
    const options = Array.isArray(o.options) ? o.options.map((x) => String(x).trim()).filter(Boolean) : [];
    let correct: string[] = [];
    if (Array.isArray(o.correctAnswer)) {
      correct = o.correctAnswer.map(String);
    } else if (typeof o.correctAnswer === 'string' && o.correctAnswer) {
      correct = [o.correctAnswer];
    }
    if ((type === 'multiple_choice' || type === 'multiple_select') && options.length === 0) {
      errors.push(`Row ${i + 1}: multiple-choice questions need options.`);
      return;
    }
    rows.push({
      type,
      text,
      options,
      correctAnswer: correct,
      explanation: typeof o.explanation === 'string' ? o.explanation : undefined,
      subjectName: typeof o.subject === 'string' ? o.subject : undefined,
      topicName: typeof o.topic === 'string' ? o.topic : undefined,
      difficulty: normalizeDifficulty(String(o.difficulty ?? 'easy')),
      tags: Array.isArray(o.tags) ? o.tags.map(String) : [],
    });
  });
  return { rows, errors };
}

export function parseCsvImport(text: string): ParsedImport {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], errors: ['CSV needs a header row and at least one question row.'] };
  }
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? cols[idx] ?? '' : '';
    };
    const typeRaw = get('type') || 'multiple_choice';
    const type = normalizeType(typeRaw);
    const text = get('question') || get('text');
    if (!type) {
      errors.push(`Row ${i + 1}: unknown question type "${typeRaw}".`);
      continue;
    }
    if (!text) {
      errors.push(`Row ${i + 1}: missing question text.`);
      continue;
    }
    const options = (get('options') || '')
      .split('|')
      .map((o) => o.trim())
      .filter(Boolean);
    const correct = (get('correct') || get('answer') || '')
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    rows.push({
      type,
      text,
      options,
      correctAnswer: correct,
      explanation: get('explanation') || undefined,
      subjectName: get('subject') || undefined,
      topicName: get('topic') || undefined,
      difficulty: normalizeDifficulty(get('difficulty')),
      tags: (get('tags') || '').split('|').map((t) => t.trim()).filter(Boolean),
    });
  }
  return { rows, errors };
}

export function parseImport(format: ImportFormat, text: string): ParsedImport {
  return format === 'json' ? parseJsonImport(text) : parseCsvImport(text);
}

export function resolveSubjectId(name?: string): string {
  if (!name) return SUBJECTS[0].id;
  const lower = name.toLowerCase();
  return SUBJECTS.find((s) => s.name.toLowerCase() === lower || lower.includes(s.name.toLowerCase()))?.id ?? SUBJECTS[0].id;
}

export function resolveTopicId(subjectId: string, name?: string): string {
  if (!name) {
    const t = TOPICS.find((x) => x.subjectId === subjectId);
    return t?.id ?? TOPICS[0].id;
  }
  const lower = name.toLowerCase();
  return (
    TOPICS.find((t) => t.subjectId === subjectId && (t.name.toLowerCase() === lower || lower.includes(t.name.toLowerCase())))
      ?.id ?? TOPICS.find((t) => t.subjectId === subjectId)?.id ?? TOPICS[0].id
  );
}

export function importRowsToQuestions(rows: ImportRow[]): Question[] {
  return rows.map((row) => {
    const subjectId = resolveSubjectId(row.subjectName);
    const topicId = resolveTopicId(subjectId, row.topicName);
    const options = row.options.map((text) => ({ id: uid('opt'), text }));
    const correctAnswer = row.type === 'essay' ? [] : row.correctAnswer;
    const points = row.type === 'essay' ? 20 : row.type === 'multiple_select' ? 10 : 5;
    return {
      id: uid('q'),
      type: row.type,
      text: row.text,
      options,
      correctAnswer,
      explanation: row.explanation,
      subjectId,
      topicId,
      difficulty: row.difficulty,
      tags: row.tags,
      points,
      estimatedSeconds: 60,
      author: 'Import',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
    };
  });
}

export function findDuplicates(rows: ImportRow[], existing: Question[]): string[] {
  const seen = new Set(existing.map((q) => q.text.trim().toLowerCase()));
  return rows.filter((r) => seen.has(r.text.trim().toLowerCase())).map((r) => r.text);
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportQuestionsJson(questions: Question[]): void {
  downloadFile('quizmind-questions.json', JSON.stringify(questions, null, 2), 'application/json');
}

export function exportQuestionsCsv(questions: Question[]): void {
  const header = 'type,question,options,correct,explanation,subject,topic,difficulty,tags';
  const lines = questions.map((q) =>
    [
      q.type,
      `"${q.text.replace(/"/g, '""')}"`,
      q.options.map((o) => o.text).join('|').replace(/"/g, '""'),
      q.correctAnswer.join('|'),
      `"${(q.explanation ?? '').replace(/"/g, '""')}"`,
      '',
      '',
      q.difficulty,
      q.tags.join('|'),
    ].join(',')
  );
  downloadFile('quizmind-questions.csv', [header, ...lines].join('\n'), 'text/csv');
}