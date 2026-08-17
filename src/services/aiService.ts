import type { AiGenerationConfig, Question } from '../types';
import { uid } from '../lib/utils';
import { generateMockQuestions } from './mockAi';
import { topicName, subjectName } from '../data/demoData';

/**
 * QuizMind AI Service abstraction.
 *
 * Two providers exist:
 *  - `gemini`: real Google Gemini generation (requires an API key at runtime).
 *  - `demo`:  a curated mock generator. It is ALWAYS labeled as "Demo mode"
 *             and is never presented as real AI.
 */

export type AiProvider = 'demo' | 'gemini';

export interface AiServiceResult {
  provider: AiProvider;
  questions: Question[];
  rawModel?: string;
}

export interface AiService {
  readonly provider: AiProvider;
  generate(config: AiGenerationConfig): Promise<AiServiceResult>;
}

/** Runtime key source. The key is kept in memory and never persisted. */
export interface AiKeyProvider {
  getKey(): string | undefined;
}

export class MockAiService implements AiService {
  readonly provider: AiProvider = 'demo';
  private latencyMs = 900;

  setLatency(ms: number) {
    this.latencyMs = ms;
  }

  async generate(config: AiGenerationConfig): Promise<AiServiceResult> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return { provider: this.provider, questions: generateMockQuestions(config) };
  }
}

export class GeminiAiService implements AiService {
  readonly provider: AiProvider = 'gemini';
  private model = 'gemini-2.0-flash';

  constructor(private keyProvider: AiKeyProvider) {}

  async generate(config: AiGenerationConfig): Promise<AiServiceResult> {
    const key = this.keyProvider.getKey();
    if (!key) {
      throw new Error('No Gemini API key configured. Add one in Settings → AI Settings.');
    }

    // Dynamic import keeps @google/genai out of the initial bundle and fails
    // gracefully on networks that block the CDN dependencies.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = this.buildPrompt(config);
    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text ?? '';
    return { provider: this.provider, questions: this.parseQuestions(text, config), rawModel: this.model };
  }

  private buildPrompt(config: AiGenerationConfig): string {
    const subject = subjectName(config.subjectId);
    const topic = topicName(config.topicId);
    return [
      `You are a professional assessment author for the QuizMind platform.`,
      `Create exactly ${config.count} ${config.questionType.replace('_', ' ')} question(s).`,
      `- Subject: ${subject}`,
      `- Topic: ${topic}`,
      `- Educational level: ${config.educationLevel}`,
      `- Difficulty: ${config.difficulty}`,
      `- Language: ${config.language}`,
      config.objectives ? `- Learning objectives: ${config.objectives}` : '',
      config.includeExplanations ? '- Include a clear explanation for each question.' : '- Explanations: none.',
      `Respond ONLY with a JSON array (no markdown fences). Each object must have:`,
      `{"text": string, "options": [{"id": "a", "text": string}...], "correctAnswer": [ids], "explanation"?: string}.`,
      `For true_false, options are [{"id":"true","text":"True"},{"id":"false","text":"False"}].`,
      `For short_answer/fill_blank/essay, options is empty and correctAnswer holds accepted strings (empty for essay).`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private parseQuestions(raw: string, config: AiGenerationConfig): Question[] {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) {
      throw new Error('AI returned an unparseable response. Please try again.');
    }
    const json = cleaned.slice(start, end + 1);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('AI returned invalid JSON. Please try again.');
    }
    if (!Array.isArray(parsed)) {
      throw new Error('AI response was not an array of questions.');
    }
    return parsed
      .slice(0, config.count)
      .map((item, i) => this.normalize(item, config, i));
  }

  private normalize(item: unknown, config: AiGenerationConfig, index: number): Question {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Question #${index + 1} was invalid.`);
    }
    const obj = item as Record<string, unknown>;
    const text = typeof obj.text === 'string' ? obj.text : '';
    if (!text) throw new Error(`Question #${index + 1} was missing text.`);

    const options = Array.isArray(obj.options)
      ? (obj.options as Array<Record<string, unknown>>)
          .filter((o) => o && typeof o.text === 'string')
          .map((o, _i) => ({ id: typeof o.id === 'string' && o.id ? o.id : uid('opt'), text: o.text as string }))
      : [];
    const correct = Array.isArray(obj.correctAnswer)
      ? (obj.correctAnswer as unknown[]).map(String)
      : [];

    return {
      id: uid('q'),
      type: config.questionType,
      text,
      options,
      correctAnswer: config.questionType === 'essay' ? [] : correct,
      explanation: typeof obj.explanation === 'string' && obj.explanation ? obj.explanation : undefined,
      subjectId: config.subjectId,
      topicId: config.topicId,
      difficulty: config.difficulty,
      tags: [topicName(config.topicId), 'ai-generated'],
      points: config.questionType === 'essay' ? 20 : config.questionType === 'multiple_select' ? 10 : 5,
      estimatedSeconds: config.questionType === 'essay' ? 600 : 60,
      author: 'AI Studio (Gemini)',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
    };
  }
}

export function createAiService(keyProvider: AiKeyProvider): AiService {
  return new GeminiAiService(keyProvider);
}

export const demoAiService = new MockAiService();