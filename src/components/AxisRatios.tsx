import { AXES } from '../data/axes';
import type { TypeCode } from '../data/types';

interface Props {
  code: TypeCode;
  /** 축 순서대로 왼쪽 성향 선택 수. 비어 있으면(공유 링크로 들어온 경우) 비율 대신 안내를 보여 준다 */
  leftCounts: number[];
  perAxis?: number;
}

/** 측정치가 아닌 “12문항 중 몇 번 골랐는지”를 그대로 보여 주는 응답 선택 비율 */
export function AxisRatios({ code, leftCounts, perAxis = 3 }: Props) {
  const hasData = leftCounts.length === AXES.length;

  return (
    <div>
      <p className="mb-4 text-[13px] leading-relaxed text-faint">
        {hasData
          ? `각 축 ${perAxis}문항 중 어느 쪽 선택지를 골랐는지 센 값이에요. 성격을 측정한 점수가 아니에요.`
          : '공유 링크에는 응답 내용이 담기지 않아 선택 비율을 보여 드릴 수 없어요. 직접 테스트하면 내 비율을 볼 수 있어요.'}
      </p>
      <ul className="space-y-4">
        {AXES.map((axis, i) => {
          const winnerLeft = code[i] === axis.left.pole;
          const left = hasData ? leftCounts[i] : winnerLeft ? perAxis : 0;
          const right = perAxis - left;
          const leftPct = Math.round((left / perAxis) * 100);
          return (
            <li key={axis.id}>
              <div className="mb-1.5 flex items-center justify-between text-[14px]">
                <span className={winnerLeft ? 'font-bold text-ink' : 'text-faint'}>
                  {axis.left.pole} · {axis.left.label}
                  {hasData && <span className="ml-1 tabular-nums">{left}</span>}
                </span>
                <span className="text-[12px] text-faint">{axis.name}</span>
                <span className={!winnerLeft ? 'font-bold text-ink' : 'text-faint'}>
                  {hasData && <span className="mr-1 tabular-nums">{right}</span>}
                  {axis.right.label} · {axis.right.pole}
                </span>
              </div>
              {hasData ? (
                <div
                  className="flex h-3 overflow-hidden rounded-full bg-line"
                  role="img"
                  aria-label={`${axis.name}: ${axis.left.label} ${left}번, ${axis.right.label} ${right}번 선택`}
                >
                  <div className="h-full rounded-l-full bg-brand transition-[width] duration-700" style={{ width: `${leftPct}%` }} />
                  <div className="h-full flex-1 bg-[#c9c7f7]" />
                </div>
              ) : (
                <div className="h-px bg-line" aria-hidden />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
