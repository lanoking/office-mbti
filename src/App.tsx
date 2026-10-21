import { useCallback, useState } from 'react';
import { QUESTIONS } from './data/questions';
import { TYPES, type TypeCode } from './data/types';
import { useHashRoute } from './hooks/useHashRoute';
import { IncompleteAnswersError, scoreAnswers, type Answers } from './lib/scoring';
import {
  clearProgress,
  loadProgress,
  loadResult,
  saveProgress,
  saveResult,
  type Progress,
  type SavedResult,
} from './lib/storage';
import { useToast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { MatchPage } from './pages/MatchPage';
import { ResultPage } from './pages/ResultPage';
import { TestPage } from './pages/TestPage';

const EMPTY: Progress = { answers: {}, index: 0 };

export default function App() {
  const { route, navigate } = useHashRoute();
  const toast = useToast();
  const [progress, setProgress] = useState<Progress>(() => loadProgress() ?? EMPTY);
  const [saved, setSaved] = useState<SavedResult | null>(() => loadResult());
  const [analyzing, setAnalyzing] = useState<TypeCode | null>(null);

  const updateProgress = useCallback((next: Progress) => {
    setProgress(next);
    saveProgress(next); // 새로고침해도 이어서 할 수 있도록 매 응답마다 저장
  }, []);

  const startFresh = useCallback(() => {
    clearProgress();
    setProgress(EMPTY);
    navigate({ name: 'test' });
  }, [navigate]);

  const finish = useCallback(
    (answers: Answers) => {
      let result;
      try {
        result = scoreAnswers(answers);
      } catch (err) {
        if (err instanceof IncompleteAnswersError) {
          const firstMissing = QUESTIONS.findIndex((q) => q.id === err.missing[0]);
          updateProgress({ answers, index: Math.max(firstMissing, 0) });
          toast('아직 답하지 않은 질문이 있어요.', 'error');
          return;
        }
        throw err;
      }
      const record: SavedResult = {
        code: result.code,
        leftCounts: result.axes.map((a) => a.leftCount),
        savedAt: new Date().toISOString(),
      };
      setAnalyzing(result.code);
      window.setTimeout(() => {
        if (!saveResult(record)) toast('이 브라우저에서는 결과를 저장할 수 없어요. 링크로 공유해 두세요!', 'error');
        setSaved(record);
        clearProgress();
        setProgress(EMPTY);
        setAnalyzing(null);
        navigate({ name: 'result', code: result.code }, { replace: true });
      }, 1100);
    },
    [navigate, toast, updateProgress],
  );

  let page;
  if (analyzing) {
    page = (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center" role="status" aria-live="polite">
        <span className="animate-bob text-[64px]" aria-hidden>
          🔍
        </span>
        <p className="mt-5 text-[20px] font-bold">회사생활 캐릭터 분석 중…</p>
        <p className="mt-1 text-[15px] text-sub">12개의 선택을 모으는 중이에요</p>
      </div>
    );
  } else if (route.name === 'test') {
    page = (
      <TestPage
        progress={progress}
        onChange={updateProgress}
        onFinish={finish}
        onExit={() => navigate({ name: 'home' })}
      />
    );
  } else if (route.name === 'result') {
    page = <ResultPage code={route.code} saved={saved} onRetake={startFresh} navigate={navigate} />;
  } else if (route.name === 'match') {
    page = <MatchPage a={route.a} b={route.b} myCode={saved?.code} navigate={navigate} />;
  } else {
    page = (
      <HomePage
        progress={progress.index > 0 || Object.keys(progress.answers).length > 0 ? progress : null}
        saved={saved}
        onStart={startFresh}
        onContinue={() => navigate({ name: 'test' })}
        navigate={navigate}
      />
    );
  }

  const inTest = route.name === 'test' && !analyzing;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      {!inTest && (
        <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-md">
          <nav className="mx-auto flex h-14 max-w-lg items-center justify-between px-4" aria-label="주요 메뉴">
            <a href="#/" className="flex items-center gap-1.5 text-[16px] font-extrabold tracking-tight">
              <span aria-hidden>💼</span> OFFICE MBTI
            </a>
            <div className="flex items-center gap-1">
              {saved && route.name !== 'result' && (
                <a href={`#/result/${saved.code}`} className="rounded-xl px-3 py-2 text-[14px] font-semibold text-sub hover:bg-black/[0.04]">
                  {TYPES[saved.code].emoji} 내 결과
                </a>
              )}
              <a
                href={saved ? `#/match/${saved.code}` : '#/match'}
                className="rounded-xl px-3 py-2 text-[14px] font-semibold text-sub hover:bg-black/[0.04]"
              >
                💞 궁합
              </a>
            </div>
          </nav>
        </header>
      )}
      <main
        id="main"
        tabIndex={-1}
        className={`mx-auto max-w-lg px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] outline-none ${inTest ? 'pt-4' : 'pt-2'}`}
      >
        {page}
        {!inTest && (
<footer className="mt-8 text-center text-[12px] text-faint">환경재단 jw</footer>
        )}
      </main>
    </div>
  );
}
