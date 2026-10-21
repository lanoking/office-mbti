import { useCallback, useEffect, useRef, useState } from 'react';
import { QUESTIONS, TOTAL_QUESTIONS, type Choice } from '../data/questions';
import type { Progress } from '../lib/storage';
import { Button } from '../components/ui';

interface Props {
  progress: Progress;
  onChange: (next: Progress) => void;
  onFinish: (answers: Progress['answers']) => void;
  onExit: () => void;
}

const ADVANCE_DELAY = 220;

export function TestPage({ progress, onChange, onFinish, onExit }: Props) {
  const { answers, index } = progress;
  const question = QUESTIONS[index];
  const [dir, setDir] = useState<'next' | 'back'>('next');
  const [picked, setPicked] = useState<Choice | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const busy = useRef(false);

  const answeredCount = Object.keys(answers).length;
  const percent = Math.round(((index + (answers[question.id] ? 1 : 0)) / TOTAL_QUESTIONS) * 100);

  useEffect(() => {
    setPicked(null);
    busy.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  const choose = useCallback(
    (choice: Choice) => {
      if (busy.current) return;
      busy.current = true;
      setPicked(choice);
      const nextAnswers = { ...answers, [question.id]: choice };
      window.setTimeout(() => {
        if (index < TOTAL_QUESTIONS - 1) {
          setDir('next');
          onChange({ answers: nextAnswers, index: index + 1 });
        } else {
          onChange({ answers: nextAnswers, index });
          onFinish(nextAnswers);
        }
      }, ADVANCE_DELAY);
    },
    [answers, index, onChange, onFinish, question.id],
  );

  const goBack = useCallback(() => {
    if (busy.current) return;
    if (index === 0) {
      onExit();
      return;
    }
    setDir('back');
    onChange({ answers, index: index - 1 });
  }, [answers, index, onChange, onExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'a' || k === '1') {
        e.preventDefault();
        choose('A');
      } else if (k === 'b' || k === '2') {
        e.preventDefault();
        choose('B');
      } else if (k === 'arrowleft' || k === 'backspace') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, goBack]);

  const selected = picked ?? answers[question.id] ?? null;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} className="-ml-3 min-h-10 px-3 text-[15px]" aria-label={index === 0 ? '처음 화면으로' : '이전 질문으로'}>
            ‹ {index === 0 ? '처음으로' : '이전'}
          </Button>
          <p className="text-[14px] font-semibold text-sub tabular-nums" aria-live="polite">
            <span className="text-brand">{index + 1}</span> / {TOTAL_QUESTIONS}
          </p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-[#e4e2f3]"
          role="progressbar"
          aria-label="진행률"
          aria-valuemin={0}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-valuenow={answeredCount}
          aria-valuetext={`${TOTAL_QUESTIONS}문항 중 ${answeredCount}문항 응답`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a5a7ff] to-brand transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(percent, 4)}%` }}
          />
        </div>
      </div>

      <div key={question.id} className={dir === 'next' ? 'animate-slide-in' : 'animate-slide-back'}>
        <div className="rounded-[28px] bg-white px-6 pt-8 pb-7 text-center shadow-card">
          <span className="text-[52px] leading-none" aria-hidden>
            {question.emoji}
          </span>
          <p className="mt-4 text-[13px] font-semibold tracking-wider text-brand">Q{index + 1}</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-[22px] leading-snug font-bold tracking-tight outline-none sm:text-[24px]">
            {question.prompt}
          </h1>
        </div>

        <div className="mt-4 flex flex-col gap-3" role="group" aria-label="답변 선택">
          {(['A', 'B'] as const).map((key) => {
            const isSel = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => choose(key)}
                aria-pressed={isSel}
                aria-keyshortcuts={key === 'A' ? 'A 1' : 'B 2'}
                className={`group flex min-h-[76px] w-full items-center gap-4 rounded-3xl px-5 py-4 text-left shadow-card ring-2 transition duration-150 active:scale-[0.98] ${
                  isSel ? 'bg-brand-soft ring-brand' : 'bg-white ring-transparent hover:ring-[#d3d1ff]'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold transition ${
                    isSel ? 'bg-brand text-white' : 'bg-canvas text-brand group-hover:bg-brand-soft'
                  }`}
                  aria-hidden
                >
                  {key}
                </span>
                <span className="text-[16px] leading-snug font-semibold sm:text-[17px]">{question[key].text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-auto hidden pt-8 text-center text-[13px] text-faint sm:block">
        키보드 <kbd className="rounded bg-white px-1.5 py-0.5 font-sans">A</kbd> /{' '}
        <kbd className="rounded bg-white px-1.5 py-0.5 font-sans">B</kbd> 로 선택,{' '}
        <kbd className="rounded bg-white px-1.5 py-0.5 font-sans">←</kbd> 로 이전 질문
      </p>
    </div>
  );
}
