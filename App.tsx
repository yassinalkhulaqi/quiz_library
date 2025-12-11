import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ToolSelector from './components/ToolSelector';
import QuizGenerator from './components/QuizGenerator';
import Translator from './components/Translator';
import Summarizer from './components/Summarizer';
import MindMapGenerator from './components/MindMapGenerator';
import StartQuizScreen from './components/StartQuizScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import FlashcardsGenerator from './components/FlashcardsGenerator';
import FlashcardViewer from './components/FlashcardViewer';
import Chatbot from './components/Chatbot';

const AppContent: React.FC = () => {
    return (
        <>
            <div className="relative z-10 w-full flex flex-col flex-grow items-center justify-center py-8">
                <Routes>
                    <Route path="/" element={<ToolSelector />} />
                    <Route path="/quiz" element={<QuizGenerator />} />
                    <Route path="/quiz/start" element={<StartQuizScreen />} />
                    <Route path="/quiz/take" element={<QuizScreen />} />
                    <Route path="/results/current" element={<ResultsScreen />} />
                    <Route path="/results/history/:id" element={<ResultsScreen />} />
                    <Route path="/flashcards" element={<FlashcardsGenerator />} />
                    <Route path="/flashcards/view" element={<FlashcardViewer />} />
                    <Route path="/translate" element={<Translator />} />
                    <Route path="/summarize" element={<Summarizer />} />
                    <Route path="/mindmap" element={<MindMapGenerator />} />
                    <Route path="/chat" element={<Chatbot />} />
                </Routes>
            </div>
            <footer className="relative z-10 w-full text-center text-xs text-slate-500 font-['Cairo'] py-2 shrink-0">
                <p>تصميم وتطوير: م. ياسين الخلاقي</p>
                <p>للتواصل: +967 780910496</p>
            </footer>
        </>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 selection:bg-purple-500/30">
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
                <div className="absolute bottom-0 right-0 h-96 w-96 bg-[radial-gradient(circle_500px_at_50%_50%,#8b5cf6,transparent)]"></div>
            </div>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </main>
    </AppProvider>
  );
};

export default App;
