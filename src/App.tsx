import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';

// Lazy-loaded feature routes keep the initial bundle small.
const DashboardPage = lazy(() => import('./features/dashboard/Dashboard').then((m) => ({ default: m.DashboardPage })));
const QuestionBankPage = lazy(() => import('./features/questions/QuestionBank').then((m) => ({ default: m.QuestionBankPage })));
const AIStudioPage = lazy(() => import('./features/ai/AIStudio').then((m) => ({ default: m.AIStudioPage })));
const AssessmentsPage = lazy(() => import('./features/assessments/AssessmentsPage').then((m) => ({ default: m.AssessmentsPage })));
const QuizBuilderPage = lazy(() => import('./features/assessments/QuizBuilder').then((m) => ({ default: m.QuizBuilderPage })));
const TakeAssessmentPage = lazy(() => import('./features/exam/TakeAssessment').then((m) => ({ default: m.TakeAssessmentPage })));
const ResultsPage = lazy(() => import('./features/results/Results').then((m) => ({ default: m.ResultsPage })));
const AnalyticsPage = lazy(() => import('./features/analytics/Analytics').then((m) => ({ default: m.AnalyticsPage })));
const SubjectsPage = lazy(() => import('./features/subjects/Subjects').then((m) => ({ default: m.SubjectsPage })));
const SubjectDetailPage = lazy(() => import('./features/subjects/Subjects').then((m) => ({ default: m.SubjectDetailPage })));
const CollectionsPage = lazy(() => import('./features/collections/Collections').then((m) => ({ default: m.CollectionsPage })));
const StudentsPage = lazy(() => import('./features/students/Students').then((m) => ({ default: m.StudentsPage })));
const TemplatesPage = lazy(() => import('./features/templates/Templates').then((m) => ({ default: m.TemplatesPage })));
const ActivityPage = lazy(() => import('./features/activity/Activity').then((m) => ({ default: m.ActivityPage })));
const SettingsPage = lazy(() => import('./features/settings/Settings').then((m) => ({ default: m.SettingsPage })));
const ImportPage = lazy(() => import('./features/import/ImportPage').then((m) => ({ default: m.ImportPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-brand-500">
      <Spinner size={28} />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/questions" element={<QuestionBankPage />} />
              <Route path="/questions/import" element={<ImportPage />} />
              <Route path="/ai-studio" element={<AIStudioPage />} />
              <Route path="/quizzes" element={<AssessmentsPage kind="quiz" />} />
              <Route path="/quizzes/new" element={<QuizBuilderPage kind="quiz" />} />
              <Route path="/quizzes/:id" element={<QuizBuilderPage kind="quiz" />} />
              <Route path="/quizzes/:id/edit" element={<QuizBuilderPage kind="quiz" />} />
              <Route path="/exams" element={<AssessmentsPage kind="exam" />} />
              <Route path="/exams/new" element={<QuizBuilderPage kind="exam" />} />
              <Route path="/exams/:id" element={<QuizBuilderPage kind="exam" />} />
              <Route path="/exams/:id/edit" element={<QuizBuilderPage kind="exam" />} />
              <Route path="/take/:id" element={<TakeAssessmentPage />} />
              <Route path="/results/:id" element={<ResultsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/subjects/:subjectId" element={<SubjectDetailPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AppProvider>
  );
};

export default App;