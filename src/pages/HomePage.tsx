import { TOTAL_QUESTIONS } from '../data/questions';
import { TYPES, TYPE_CODES } from '../data/types';
import type { Route } from '../lib/router';
import type { Progress, SavedResult } from '../lib/storage';
import { Button, Disclaimer } from '../components/ui';

interface Props {
  progress: Progress | null;
  saved: SavedResult | null;
  onStart: () => void;
  onContinue: () => void;
  navigate: (r: Route) => void;
}

export function HomePage({ progress, saved, onStart, onContinue, navigate }: Props) {
  const answered = progress ? Object.keys(progress.answers).length : 0;
  const preview = ['EPLD', 'IPLS', 'EFHS', 'IFHD', 'IPHS', 'EFHD'] as const;

  return (
    <div className="animate-fade-up space-y-5">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#efeaff] via-[#fdf0f6] to-[#e6f6ff] px-6 pt-10 pb-8 text-center shadow-card sm:px-10">
        <div className="mx-auto grid w-fit grid-cols-3 gap-2.5" aria-hidden>
          {preview.map((code, i) => (
            <span
              key={code}
              className="flex h-14 w-14 animate-pop items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-[0_4px_12px_-4px_rgb(80_70_160/0.25)]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {TYPES[code].emoji}
            </span>
          ))}
        </div>
        <p className="mt-7 text-[13px] font-semibold tracking-[0.2em] text-brand">OFFICE MBTI</p>
        <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[32px]">
          나의 회사생활
          <br />
          캐릭터는?
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-sub">
          {TOTAL_QUESTIONS}개의 회사생활 상황에 답하고
          <br />
          16가지 캐릭터 중 나를 찾아보세요.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          {progress && answered > 0 ? (
            <>
              <Button onClick={onContinue} className="w-full">
                이어서 하기 ({answered}/{TOTAL_QUESTIONS})
              </Button>
              <Button variant="outline" onClick={onStart} className="w-full">
                처음부터 다시
              </Button>
            </>
          ) : (
            <Button onClick={onStart} className="w-full">
              테스트 시작하기
            </Button>
          )}
          {saved && (
            <Button variant="soft" onClick={() => navigate({ name: 'result', code: saved.code })} className="w-full">
              {TYPES[saved.code].emoji} 내 결과 다시 보기
            </Button>
          )}
        </div>
        <p className="mt-4 text-[13px] text-faint">약 2분 · 회원가입 없음 · 개인정보 수집 없음</p>
      </section>

      <button
        type="button"
        onClick={() => navigate({ name: 'match', a: saved?.code })}
        className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-card transition hover:bg-[#fcfcff] active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-peach text-2xl" aria-hidden>
          💞
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-bold">동료 궁합 보기</span>
          <span className="block text-[14px] text-sub">두 캐릭터의 협업 케미를 알아봐요</span>
        </span>
        <span className="text-xl text-faint" aria-hidden>
          ›
        </span>
      </button>

      <section aria-labelledby="all-types" className="rounded-3xl bg-white p-5 shadow-card">
        <h2 id="all-types" className="mb-3 text-[16px] font-bold">
          16가지 회사생활 캐릭터
        </h2>
        <ul className="grid grid-cols-4 gap-2 sm:gap-3">
          {TYPE_CODES.map((code) => (
            <li key={code}>
              <a
                href={`#/result/${code}`}
                className="flex flex-col items-center rounded-2xl px-1 py-2.5 text-center transition hover:bg-canvas"
              >
                <span className="text-[28px]" aria-hidden>
                  {TYPES[code].emoji}
                </span>
                <span className="mt-1 text-[11px] leading-tight font-medium text-sub sm:text-[12px]">
                  {TYPES[code].name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer>
        이 테스트는 재미로 즐기는 오락용 콘텐츠예요. 검증된 심리검사가 아니며, 결과로 사람을 평가하거나 업무를
        배정하는 데 쓰지 말아 주세요.
      </Disclaimer>
    </div>
  );
}
