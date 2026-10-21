import { AXES, type AxisId, type Pole } from '../data/axes';
import { QUESTIONS, type Choice, type Question } from '../data/questions';
import { isTypeCode, type TypeCode } from '../data/types';

export type Answers = Partial<Record<string, Choice>>;

export interface AxisTally {
  axis: AxisId;
  left: Pole;
  right: Pole;
  /** 왼쪽 성향을 고른 문항 수 */
  leftCount: number;
  /** 오른쪽 성향을 고른 문항 수 */
  rightCount: number;
  total: number;
  /** 왼쪽 성향 응답 비율 (0~100, 정수) */
  leftPercent: number;
  winner: Pole;
}

export interface TestResult {
  code: TypeCode;
  axes: AxisTally[];
}

export class IncompleteAnswersError extends Error {
  readonly missing: string[];
  constructor(missing: string[]) {
    super(`아직 답하지 않은 문항이 ${missing.length}개 있어요.`);
    this.name = 'IncompleteAnswersError';
    this.missing = missing;
  }
}

export function missingQuestionIds(answers: Answers, questions: readonly Question[] = QUESTIONS): string[] {
  return questions.filter((q) => answers[q.id] !== 'A' && answers[q.id] !== 'B').map((q) => q.id);
}

export function isComplete(answers: Answers, questions: readonly Question[] = QUESTIONS): boolean {
  return missingQuestionIds(answers, questions).length === 0;
}

/**
 * 12문항 응답을 채점해 16유형 중 하나를 반환한다.
 * 축별 3문항이라 동점이 생기지 않지만, 문항 수가 바뀌어 동점이 되면 왼쪽(코드 앞 글자) 성향을 택한다.
 * 모든 문항에 답하지 않으면 IncompleteAnswersError를 던진다.
 */
export function scoreAnswers(answers: Answers, questions: readonly Question[] = QUESTIONS): TestResult {
  const missing = missingQuestionIds(answers, questions);
  if (missing.length > 0) throw new IncompleteAnswersError(missing);

  const counts = new Map<Pole, number>();
  for (const q of questions) {
    const choice = answers[q.id] as Choice;
    const pole = q[choice].pole;
    counts.set(pole, (counts.get(pole) ?? 0) + 1);
  }

  const axes: AxisTally[] = AXES.map((axis) => {
    const leftCount = counts.get(axis.left.pole) ?? 0;
    const rightCount = counts.get(axis.right.pole) ?? 0;
    const total = leftCount + rightCount;
    return {
      axis: axis.id,
      left: axis.left.pole,
      right: axis.right.pole,
      leftCount,
      rightCount,
      total,
      leftPercent: total === 0 ? 50 : Math.round((leftCount / total) * 100),
      winner: leftCount >= rightCount ? axis.left.pole : axis.right.pole,
    };
  });

  const code = axes.map((a) => a.winner).join('');
  if (!isTypeCode(code)) throw new Error(`정의되지 않은 유형 코드: ${code}`);
  return { code, axes };
}
