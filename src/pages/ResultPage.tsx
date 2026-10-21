import { useMemo, useRef, useState } from 'react';
import { TYPES, type TypeCode } from '../data/types';
import { bestMatches } from '../lib/compatibility';
import { saveNodeAsPng } from '../lib/image';
import { buildShareUrl, type Route } from '../lib/router';
import { shareLink } from '../lib/share';
import type { SavedResult } from '../lib/storage';
import { AxisRatios } from '../components/AxisRatios';
import { CharacterCard } from '../components/CharacterCard';
import { useToast } from '../components/Toast';
import { Button, Card, Disclaimer, SectionTitle } from '../components/ui';

interface Props {
  code: TypeCode;
  saved: SavedResult | null;
  onRetake: () => void;
  navigate: (r: Route) => void;
}

export function ResultPage({ code, saved, onRetake, navigate }: Props) {
  const type = TYPES[code];
  const isMine = saved?.code === code;
  const cardRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const matches = useMemo(() => bestMatches(code, 3), [code]);

  async function handleSaveImage() {
    setSaving(true);
    try {
      await saveNodeAsPng(cardRef.current, `office-mbti-${code}.png`);
      toast('이미지를 저장했어요 📸');
    } catch (err) {
      toast(err instanceof Error ? err.message : '이미지를 저장하지 못했어요.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = buildShareUrl(code, window.location);
    const outcome = await shareLink({
      title: 'OFFICE MBTI — 나의 회사생활 캐릭터는?',
      text: `나는 ${type.emoji} ${type.name}(${code})! 너의 회사생활 캐릭터는?`,
      url,
    });
    if (outcome.status === 'copied') toast('결과 링크를 복사했어요 🔗');
    else if (outcome.status === 'manual') {
      setManualUrl(outcome.url);
      toast('아래 링크를 직접 복사해 주세요.', 'error');
    }
  }

  return (
    <div className="space-y-4">
      {!isMine && (
        <p className="animate-fade-up rounded-2xl bg-lemon px-4 py-3 text-center text-[14px] font-medium text-[#7a5b00]">
          {saved ? `내 캐릭터는 ${TYPES[saved.code].name}! 지금은 다른 캐릭터를 보고 있어요.` : '나는 어떤 캐릭터일까요? 테스트로 확인해 보세요!'}
        </p>
      )}

      <div className="animate-fade-up">
        <CharacterCard ref={cardRef} type={type} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={handleSaveImage} disabled={saving} aria-busy={saving}>
          {saving ? '저장 중…' : '📸 이미지 저장'}
        </Button>
        <Button variant="outline" onClick={handleShare}>
          🔗 결과 공유
        </Button>
      </div>

      {manualUrl && (
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <label htmlFor="share-url" className="mb-2 block text-[14px] font-semibold">
            결과 링크
          </label>
          <input
            id="share-url"
            readOnly
            value={manualUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-xl bg-canvas px-3 py-2.5 text-[14px] text-ink"
          />
        </div>
      )}

      <Card>
        <SectionTitle>응답 선택 비율</SectionTitle>
        <AxisRatios code={code} leftCounts={isMine ? saved!.leftCounts : []} />
      </Card>

      <Card>
        <SectionTitle>{type.emoji} 어떤 캐릭터냐면요</SectionTitle>
        <p className="text-[16px] leading-[1.75] text-ink/85">{type.description}</p>
      </Card>

      <Card className="bg-gradient-to-br from-white to-[#faf8ff]">
        <SectionTitle>😂 이거 완전 내 얘기</SectionTitle>
        <ul className="space-y-2">
          {type.relatable.map((line) => (
            <li key={line} className="rounded-2xl bg-canvas px-4 py-3 text-[15px] leading-relaxed">
              {line.includes('“') ? line : `“${line}”`}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle>💪 강점</SectionTitle>
          <ul className="space-y-2.5">
            {type.strengths.map((s) => (
              <li key={s} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-[12px] text-[#2e7a45]" aria-hidden>
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle>🌱 이런 점은 살짝 주의</SectionTitle>
          <ul className="space-y-2.5">
            {type.cautions.map((s) => (
              <li key={s} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-peach text-[12px] text-[#b4472c]" aria-hidden>
                  !
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="bg-brand-soft shadow-none">
        <SectionTitle>💡 업무 스타일 한마디</SectionTitle>
        <p className="text-[15px] leading-[1.75] text-ink/85">{type.advice}</p>
      </Card>

      <Card>
        <SectionTitle>🤝 궁합이 좋은 동료</SectionTitle>
        <ul className="space-y-2">
          {matches.map((m) => {
            const t = TYPES[m.b];
            return (
              <li key={m.b}>
                <a
                  href={`#/match/${code}/${m.b}`}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-canvas"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `linear-gradient(150deg, ${t.colors.from}, ${t.colors.to})` }}
                    aria-hidden
                  >
                    {t.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-bold">{t.name}</span>
                    <span className="block text-[13px] text-sub">
                      {m.b} · {m.title}
                    </span>
                  </span>
                  <span className="text-[17px] font-extrabold text-brand tabular-nums">{m.score}점</span>
                </a>
              </li>
            );
          })}
        </ul>
        <Button variant="soft" className="mt-3 w-full" onClick={() => navigate({ name: 'match', a: code })}>
          다른 동료와 궁합 보기
        </Button>
      </Card>

      <div className="flex flex-col gap-2.5 pt-2">
        <Button onClick={onRetake}>{isMine ? '다시 테스트하기' : '나도 테스트하기'}</Button>
        <Button variant="ghost" onClick={() => navigate({ name: 'home' })}>
          처음 화면으로
        </Button>
      </div>

      <Disclaimer>오락용 테스트예요. 결과는 재미로만 봐 주세요 🙂</Disclaimer>
    </div>
  );
}
