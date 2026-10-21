import { forwardRef } from 'react';
import { AXES, POLE_LABEL, type Pole } from '../data/axes';
import type { CharacterType } from '../data/types';

interface Props {
  type: CharacterType;
}

/** 결과 화면 중심 캐릭터 카드. PNG 저장 시 이 노드를 그대로 이미지로 만든다. */
export const CharacterCard = forwardRef<HTMLDivElement, Props>(function CharacterCard({ type }, ref) {
  const { colors } = type;
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[28px] p-6 text-center shadow-card sm:p-8"
      style={{ background: `linear-gradient(150deg, ${colors.from} 0%, ${colors.to} 100%)` }}
    >
      {/* 장식용 동그라미 */}
      <span aria-hidden className="absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/35" />
      <span aria-hidden className="absolute -right-8 bottom-16 h-24 w-24 rounded-full bg-white/30" />

      <p className="relative text-[13px] font-semibold tracking-[0.18em]" style={{ color: colors.ink }}>
        OFFICE MBTI
      </p>

      <div
        role="img"
        aria-label={`${type.name} 캐릭터`}
        className="relative mx-auto mt-5 flex h-32 w-32 animate-pop items-center justify-center rounded-full bg-white/70 text-[72px] leading-none shadow-[inset_0_-6px_0_rgb(0_0_0/0.04)] sm:h-36 sm:w-36 sm:text-[80px]"
      >
        <span className="animate-bob">{type.emoji}</span>
      </div>

      <p className="relative mt-5 font-mono text-[15px] font-bold tracking-[0.3em]" style={{ color: colors.ink }}>
        {type.code}
      </p>
      <h1 className="relative mt-1 text-[30px] font-extrabold tracking-tight text-ink sm:text-[34px]">{type.name}</h1>
      <p className="relative mx-auto mt-2 max-w-[22rem] text-[15px] leading-relaxed text-ink/75">{type.tagline}</p>

      <ul className="relative mt-5 flex flex-wrap justify-center gap-1.5" aria-label="성향 키워드">
        {AXES.map((axis, i) => {
          const pole = type.code[i] as Pole;
          return (
            <li
              key={axis.id}
              className="rounded-full bg-white/75 px-3 py-1 text-[13px] font-semibold"
              style={{ color: colors.ink }}
            >
              #{POLE_LABEL[pole]}
            </li>
          );
        })}
      </ul>

      <p className="relative mt-6 text-[11px] text-ink/45">재미로 보는 오락용 테스트 · 실제 심리검사가 아니에요</p>
    </div>
  );
});
