import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyPage } from "@/lib/lazy-page";

const DashboardPage = lazyPage(() => import("@/features/dashboard/DashboardPage"));
const SettingsPage = lazyPage(() => import("@/features/settings/SettingsPage"));
const PlaceholderPage = lazyPage(() => import("@/features/placeholder/PlaceholderPage"));
const VocabPage = lazyPage(() => import("@/features/vocab/VocabPage"));
const WordDetailPage = lazyPage(() => import("@/features/vocab/WordDetailPage"));
const ReviewPage = lazyPage(() => import("@/features/review/ReviewPage"));
const PronunciationPage = lazyPage(() => import("@/features/pronunciation/PronunciationPage"));
const HanziPage = lazyPage(() => import("@/features/hanzi/HanziPage"));
const HanziDetailPage = lazyPage(() => import("@/features/hanzi/HanziDetailPage"));
const QuizPage = lazyPage(() => import("@/features/quiz/QuizPage"));
const StatsPage = lazyPage(() => import("@/features/stats/StatsPage"));
const PathPage = lazyPage(() => import("@/features/path/PathPage"));
const LessonPage = lazyPage(() => import("@/features/lesson/LessonPage"));
const PlacementPage = lazyPage(() => import("@/features/placement/PlacementPage"));
const GrammarPage = lazyPage(() => import("@/features/grammar/GrammarPage"));
const GrammarDetailPage = lazyPage(() => import("@/features/grammar/GrammarDetailPage"));
const ListeningPage = lazyPage(() => import("@/features/listening/ListeningPage"));
const ListeningDetailPage = lazyPage(() => import("@/features/listening/ListeningDetailPage"));
const PracticePage = lazyPage(() => import("@/features/practice/PracticePage"));
const PracticeSessionPage = lazyPage(() => import("@/features/practice/PracticeSessionPage"));
const TestPage = lazyPage(() => import("@/features/test/TestPage"));

// Các module chưa làm — thay dần bằng page thật theo docs/ROADMAP.md
const PLANNED = [
  "/reading",
  "/reading/:id",
  "/exam",
  "/dictionary",
];

export default function App() {
  return (
    <HashRouter>
      <TooltipProvider delayDuration={300}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/vocab" element={<VocabPage />} />
            <Route path="/vocab/:wordId" element={<WordDetailPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/pronunciation" element={<PronunciationPage />} />
            <Route path="/hanzi" element={<HanziPage />} />
            <Route path="/hanzi/:char" element={<HanziDetailPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/path" element={<PathPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/placement" element={<PlacementPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/grammar/:id" element={<GrammarDetailPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/listening/:id" element={<ListeningDetailPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/:mode" element={<PracticeSessionPage />} />
            <Route path="/test/:id" element={<TestPage />} />
            {PLANNED.map((p) => (
              <Route key={p} path={p} element={<PlaceholderPage />} />
            ))}
            <Route path="*" element={<PlaceholderPage />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </HashRouter>
  );
}
