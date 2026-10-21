import { AXES, type AxisId, type Pole } from '../data/axes';
import { TYPE_CODES, type TypeCode } from '../data/types';

/** 축별 가산점 (오락용 임의 규칙) */
export const COMPAT_RULES: Record<AxisId, { match: number; mismatch: number }> = {
  EI: { match: 15, mismatch: 5 }, // 소통 방식
  PF: { match: 15, mismatch: 5 }, // 업무 처리
  LH: { match: 10, mismatch: 5 }, // 의사결정
  DS: { match: 5, mismatch: 10 }, // 업무 태도: 주도+지원 조합이 오히려 잘 맞는다는 설정
};

export const BASE_SCORE = 50;

export interface AxisCompat {
  axis: AxisId;
  axisName: string;
  a: Pole;
  b: Pole;
  same: boolean;
  points: number;
  tip: string;
}

export interface CompatResult {
  a: TypeCode;
  b: TypeCode;
  score: number;
  title: string;
  summary: string;
  axes: AxisCompat[];
}

const SAME_TIPS: Record<Pole, string> = {
  E: '둘 다 말로 푸는 스타일! 대화가 빠른 만큼, 정한 내용은 메신저로 한 줄 남겨 두면 완벽해요.',
  I: '둘 다 조용히 집중하는 스타일. 문서와 메신저로 소통하면 서로의 몰입 시간을 지켜 줄 수 있어요.',
  P: '둘 다 계획파라 일정이 척척! 가끔은 “계획에 없던 시도”도 함께 열어 두면 더 재밌어요.',
  F: '둘 다 유연한 순발력파. 마감일 하나만 같이 박아 두면 즉흥 에너지가 성과로 이어져요.',
  L: '근거로 대화하는 두 사람. 결론이 빠른 만큼, 결정이 팀원들에게 어떻게 느껴질지 한 번만 같이 체크해요.',
  H: '서로의 마음을 잘 아는 두 사람. 다정함은 그대로, 판단 기준은 한 줄로 정리해 두면 더 단단해져요.',
  D: '둘 다 앞장서는 추진력! 시작 전에 “이건 네가, 저건 내가” 역할만 나누면 시너지가 폭발해요.',
  S: '서로 챙겨 주는 따뜻한 조합. 누가 최종 결정을 할지 미리 정해 두면 일이 더 빨리 굴러가요.',
};

const DIFF_TIPS: Record<AxisId, string> = {
  EI: '한 명은 말로, 한 명은 글로 생각해요. 회의 전에 안건을 미리 공유하면 둘 다 실력을 100% 발휘해요.',
  PF: '계획파와 순발력파의 만남! 큰 일정은 계획파가, 돌발 상황은 유연파가 맡으면 빈틈이 사라져요.',
  LH: '논리와 공감이 한 팀이에요. 근거는 한 명이, 전달 방식은 다른 한 명이 다듬으면 설득력이 두 배!',
  DS: '앞에서 끄는 사람과 뒤에서 받치는 사람. 서로의 역할을 인정해 주면 최고의 페어가 돼요.',
};

function bandOf(score: number): { title: string; summary: string } {
  if (score >= 95) return { title: '환상의 콤비 ✨', summary: '말하지 않아도 통하는 사이! 같이 맡은 프로젝트는 일단 기대해도 좋아요.' };
  if (score >= 85) return { title: '찰떡 파트너 🍡', summary: '호흡이 척척 맞는 조합이에요. 서로의 강점을 살리면 성과가 쑥쑥 자라요.' };
  if (score >= 78) return { title: '든든한 팀메이트 🤜🤛', summary: '비슷한 듯 다른 매력으로 서로를 채워 주는 좋은 동료 사이예요.' };
  return { title: '서로 배우는 페어 🌱', summary: '다른 점이 많아서 오히려 배울 게 많은 조합! 함께하면 시야가 넓어져요.' };
}

export function calculateCompatibility(a: TypeCode, b: TypeCode): CompatResult {
  const axes: AxisCompat[] = AXES.map((axis, i) => {
    const pa = a[i] as Pole;
    const pb = b[i] as Pole;
    const same = pa === pb;
    const rule = COMPAT_RULES[axis.id];
    return {
      axis: axis.id,
      axisName: axis.name,
      a: pa,
      b: pb,
      same,
      points: same ? rule.match : rule.mismatch,
      tip: same ? SAME_TIPS[pa] : DIFF_TIPS[axis.id],
    };
  });
  const score = BASE_SCORE + axes.reduce((sum, x) => sum + x.points, 0);
  return { a, b, score, ...bandOf(score), axes };
}

/** 나를 제외한 유형을 점수 높은 순으로 (동점은 유형 목록 순서) */
export function bestMatches(code: TypeCode, limit = 3): CompatResult[] {
  return TYPE_CODES.filter((other) => other !== code)
    .map((other) => calculateCompatibility(code, other))
    .sort((x, y) => y.score - x.score || TYPE_CODES.indexOf(x.b) - TYPE_CODES.indexOf(y.b))
    .slice(0, limit);
}
