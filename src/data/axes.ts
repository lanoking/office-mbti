// 4개 성향 축 정의
// 코드 순서: [소통 E/I] [업무처리 P/F] [의사결정 L/H] [업무태도 D/S]

export type AxisId = 'EI' | 'PF' | 'LH' | 'DS';
export type Pole = 'E' | 'I' | 'P' | 'F' | 'L' | 'H' | 'D' | 'S';

export interface AxisInfo {
  id: AxisId;
  /** 궁합/설명에서 쓰는 축 이름 */
  name: string;
  /** 축의 왼쪽(코드 앞 글자) 성향 */
  left: { pole: Pole; label: string };
  /** 축의 오른쪽(코드 뒤 글자) 성향 */
  right: { pole: Pole; label: string };
}

export const AXES: readonly AxisInfo[] = [
  { id: 'EI', name: '소통 방식', left: { pole: 'E', label: '적극 소통' }, right: { pole: 'I', label: '조용한 집중' } },
  { id: 'PF', name: '업무 처리', left: { pole: 'P', label: '계획 설계' }, right: { pole: 'F', label: '유연한 대응' } },
  { id: 'LH', name: '의사결정', left: { pole: 'L', label: '논리·근거' }, right: { pole: 'H', label: '관계·공감' } },
  { id: 'DS', name: '업무 태도', left: { pole: 'D', label: '주도·추진' }, right: { pole: 'S', label: '지원·협력' } },
] as const;

export const AXIS_IDS: readonly AxisId[] = AXES.map((a) => a.id);

export const POLE_LABEL: Record<Pole, string> = Object.fromEntries(
  AXES.flatMap((a) => [
    [a.left.pole, a.left.label],
    [a.right.pole, a.right.label],
  ]),
) as Record<Pole, string>;

export function axisOfPole(pole: Pole): AxisInfo {
  const axis = AXES.find((a) => a.left.pole === pole || a.right.pole === pole);
  if (!axis) throw new Error(`알 수 없는 성향 문자: ${pole}`);
  return axis;
}
