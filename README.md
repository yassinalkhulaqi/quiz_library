<div align="center">

# QuizMind — AI-Powered Assessment Platform

**Create, manage, practice, analyze, and improve quizzes and exams — with optional AI question generation.**

[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4)](https://ai.google.dev/)

</div>

QuizMind is a single-page assessment platform for teachers and students. It runs entirely in the browser — demo data is preloaded so you can explore every feature without a backend. A local question bank, quiz/exam builder, timed exam mode, results review, analytics dashboards, and an AI Studio round out the workflow.

## Features

- **Question Bank** — create, edit, duplicate, archive, preview, and delete questions across six types (multiple choice, multiple select, true/false, short answer, fill-in-the-blank, essay). Filter by subject, topic, difficulty, and status; bulk archive; add to collections.
- **AI Studio** — configure subject, topic, difficulty, question type, and count, then generate a batch of questions. Works with a **Gemini API key** (set in Settings or via `VITE_GEMINI_API_KEY`) or in **demo mode** with curated templates.
- **Quiz & Exam Builder** — a four-step wizard to name, pick questions, and configure settings (time limit, attempts, passing score, randomization, answer reveal, review marking).
- **Exam Mode** — timed, navigable assessment with progress tracking and answer review marking.
- **Results & Analytics** — per-attempt results with per-topic breakdowns and recommendations, plus overview/question/insight dashboards.
- **Subjects & Topics** — browse subjects, drill into topics, and see difficulty distribution.
- **Students, Collections, Templates, Activity, Settings** — roster overview, question grouping, one-click assessment templates, activity feed, theme/profile/notification/AI settings, and one-click demo-data reset.
- **Import / Export** — import questions from JSON or CSV (with duplicate detection) and export the bank.
- **Role switch** — toggle between a teacher view and a student view (demo).

## Quick Start

### Prerequisites

- Node.js 20+

### Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000. A demo account is preloaded — sign in as **Teacher** or **Student** from the login page.

### Optional: enable real AI generation

1. Get a key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Either set it in the app at **Settings → AI Settings**, or create a local env file:

```bash
cp .env.example .env.local   # then add your key
```

> Your key is read at runtime and kept in memory only — it is never stored or committed. Without a key, AI Studio transparently runs in **demo mode**.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server on :3000   |
| `npm run build`   | Typecheck then production build      |
| `npm run typecheck` | Run `tsc --noEmit`                 |
| `npm run lint`    | ESLint over `src`                    |
| `npm test`        | Run the vitest suite                 |
| `npm run preview` | Preview the production build         |

## Tech Stack

- **React 19** + TypeScript, **Vite 6**, **Tailwind CSS 4**, **React Router 6**
- State persisted to `localStorage` under the `quizmind:` prefix
- Optional AI via `@google/genai` (runtime key, in-memory only)
- Vitest for unit tests; GitHub Actions CI runs lint, typecheck, tests, and build

## Project Structure

```
src/
  components/       # UI kit (ui/) and layout (layout/)
  features/         # dashboard, questions, ai, assessments, exam,
                    # results, analytics, subjects, collections,
                    # students, templates, activity, settings, import
  pages/            # Landing & Login
  context/          # AppContext (global state + persistence)
  lib/              # scoring, utils, storage, navigation
  services/         # aiService (Gemini + demo), mockAi, importExport
  data/             # demo data (subjects, topics, questions, attempts…)
  types/            # shared TypeScript types
```

## Notes on the Demo

- All data starts from realistic seeded content (Cybersecurity, Networking, Programming, Mathematics, Databases) and can be reset any time from **Settings**.
- "Teacher" and "Student" are demo roles — there is no real authentication or backend.
- AI output is clearly labeled **Demo mode** when no Gemini key is configured.
- Essays are auto-marked as correct when non-empty (a demo simplification).

## License

Private project. See your repository owner for usage terms.