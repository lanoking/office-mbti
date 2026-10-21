import { useEffect, useId, useState } from 'react';
import { AXES, POLE_LABEL } from '../data/axes';
import { TYPES, TYPE_CODES, isTypeCode, type TypeCode } from '../data/types';
import { BASE_SCORE, COMPAT_RULES, calculateCompatibility } from '../lib/compatibility';
import type { Route } from '../lib/router';
import { Button, Card, Disclaimer, SectionTitle } from '../components/ui';

interface Props {
  a?: TypeCode;
  b?: TypeCode;
  myCode?: TypeCode;
  navigate: (r: Route, opts?: { replace?: boolean }) => void;
}

function TypePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: TypeCode;
  onChange: (code: TypeCode | undefined) => void;
}) {
  const id = useId();
  const t = value ? TYPES[value] : null;
  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="mb-2 block text-center text-[13px] font-semibold text-sub">
        {label}
      </label>
      <div
        className="relative flex flex-col items-center rounded-3xl bg-white px-2 pt-4 pb-3 shadow-card ring-2 ring-transparent transition focus-within:ring-brand"
        style={t ? { background: `linear-gradient(150deg, ${t.colors.from}, ${t.colors.to})` } : undefined}
      >
        <span className="text-[44px] leading-none" aria-hidden>
          {t ? t.emoji : '❔'}
        </span>
        <span className="mt-2 text-[15px] font-bold">{t ? t.name : '유형 선택'}</span>
        <span className="text-[12px] font-semibold tracking-widest text-ink/50">{t ? t.code : '눌러서 고르기'}</span>
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(isTypeCode(e.target.value) ? e.target.value : undefined)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="">유형을 선택하세요</option>
          {TYPE_CODES.map((code) => (
            <option key={code} value={code}>
              {TYPES[code].emoji} {code} {TYPES[code].name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#ecebff" strokeWidth="11" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9ec4" />
            <stop offset="100%" stopColor="#6b6ef9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[38px] leading-none font-extrabold tabular-nums">{score}</span>
        <span className="mt-1 text-[13px] font-semibold text-sub">점</span>
      </div>
    </div>
  );
}

export function MatchPage({ a, b, myCode, navigate }: Props) {
  const [left, setLeft] = useState<TypeCode | undefined>(a ?? myCode);
  const [b2, setB2] = useState<TypeCode | undefined>(b);

  // 링크로 들어오거나 다른 화면에서 이동해 오면 URL 값으로 맞춘다
  useEffect(() => {
    setLeft(a ?? myCode);
    setB2(b);
  }, [a, b, myCode]);

  const result = left && b2 ? calculateCompatibility(left, b2) : null;

  const set = (na?: TypeCode, nb?: TypeCode) => {
    setLeft(na);
    setB2(nb);
    // 두 유형이 모두 골라졌을 때만 공유 가능한 URL로 갱신 (유형 코드만 포함)
    if (na && nb) navigate({ name: 'match', a: na, b: nb }, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="animate-fade-up text-center">
        <p className="text-[13px] font-semibold tracking-[0.2em] text-brand">COWORKER MATCH</p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight">동료 궁합 보기</h1>
        <p className="mt-1 text-[15px] text-sub">두 캐릭터를 고르면 협업 케미를 알려 드려요</p>
      </div>

      <div className="flex items-end gap-3">
        <TypePicker label={myCode && left === myCode ? '나' : '캐릭터 1'} value={left} onChange={(v) => set(v, b2)} />
        <span className="mb-12 text-2xl" aria-hidden>
          💞
        </span>
        <TypePicker label="동료" value={b2} onChange={(v) => set(left, v)} />
      </div>

      {!result && (
        <p className="rounded-2xl bg-white/70 px-4 py-6 text-center text-[15px] text-sub">
          {left ? '동료의 캐릭터를 골라 주세요.' : '두 캐릭터를 모두 골라 주세요.'}
        </p>
      )}

      {result && (
        <div key={`${result.a}-${result.b}`} className="animate-fade-up space-y-4" aria-live="polite">
          <Card className="text-center">
            <ScoreRing score={result.score} />
            <h2 className="mt-3 text-[22px] font-extrabold">{result.title}</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-sub">{result.summary}</p>
          </Card>

          <Card>
            <SectionTitle>축별 협업 팁</SectionTitle>
            <ul className="space-y-3">
              {result.axes.map((x) => (
                <li key={x.axis} className="rounded-2xl bg-canvas p-4">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold">{x.axisName}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-sub">
                      {x.same ? `둘 다 ${POLE_LABEL[x.a]}` : `${POLE_LABEL[x.a]} × ${POLE_LABEL[x.b]}`}
                    </span>
                    <span className="ml-auto text-[14px] font-extrabold text-brand tabular-nums">+{x.points}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink/85">{x.tip}</p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={() => navigate({ name: 'result', code: result.b })}>
              {TYPES[result.b].emoji} 동료 캐릭터
            </Button>
            <Button variant="outline" onClick={() => set(result.b, result.a)}>
              ⇄ 자리 바꾸기
            </Button>
          </div>
        </div>
      )}

      <details className="rounded-2xl bg-white/70 px-4 py-3 text-[14px] text-sub">
        <summary className="cursor-pointer font-semibold text-ink">궁합 점수는 이렇게 계산해요</summary>
        <p className="mt-2">기본 {BASE_SCORE}점에서 시작해 축마다 점수를 더해요.</p>
        <ul className="mt-1.5 space-y-0.5">
          {AXES.map((axis) => (
            <li key={axis.id}>
              {axis.name}: 같으면 +{COMPAT_RULES[axis.id].match}, 다르면 +{COMPAT_RULES[axis.id].mismatch}
            </li>
          ))}
        </ul>
      </details>

      <Disclaimer>
        궁합 점수는 재미를 위해 정한 임의의 규칙이에요. 실제 협업 성과나 관계를 예측하지 않아요. 어떤 조합이든 서로를
        이해하면 좋은 팀이 될 수 있어요!
      </Disclaimer>

      {!myCode && (
        <Button className="w-full" onClick={() => navigate({ name: 'home' })}>
          내 캐릭터부터 알아보기
        </Button>
      )}
    </div>
  );
}
