import { describe, expect, it } from 'vitest';
import { AXES } from '../data/axes';
import { QUESTIONS, type Choice } from '../data/questions';
import { TYPE_CODES, TYPES, type TypeCode } from '../data/types';
import { IncompleteAnswersError, isComplete, scoreAnswers, type Answers } from './scoring';

/** 원하는 성향 코드가 나오도록 모든 문항의 선택지를 고른다 */
function answersFor(code: TypeCode): Answers {
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    answers[q.id] = code.includes(q.A.pole) ? 'A' : 'B';
  }
  return answers;
}

describe('질문 데이터', () => {
  it('12문항이고, 축마다 정확히 3문항씩 배정된다', () => {
    expect(QUESTIONS).toHaveLength(12);
    for (const axis of AXES) {
      expect(QUESTIONS.filter((q) => q.axis === axis.id)).toHaveLength(3);
    }
  });

  it('각 문항의 A/B는 같은 축의 서로 반대 성향이다', () => {
    for (const q of QUESTIONS) {
      const axis = AXES.find((a) => a.id === q.axis)!;
      const poles = [axis.left.pole, axis.right.pole];
      expect(poles).toContain(q.A.pole);
      expect(poles).toContain(q.B.pole);
      expect(q.A.pole).not.toBe(q.B.pole);
    }
  });

  it('문항 id는 중복되지 않는다', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });
});

describe('채점 로직', () => {
  it('16개 유형 모두 만들어질 수 있다', () => {
    const produced = new Set(TYPE_CODES.map((code) => scoreAnswers(answersFor(code)).code));
    expect(produced.size).toBe(16);
    for (const code of TYPE_CODES) expect(scoreAnswers(answersFor(code)).code).toBe(code);
  });

  it('가능한 모든 응답 조합(2^12)이 정의된 16유형 중 하나로 채점되고, 16유형 모두 등장한다', () => {
    const seen = new Map<string, number>();
    for (let mask = 0; mask < 1 << QUESTIONS.length; mask++) {
      const answers: Answers = {};
      QUESTIONS.forEach((q, i) => {
        answers[q.id] = (mask >> i) & 1 ? 'B' : 'A';
      });
      const { code } = scoreAnswers(answers);
      expect(TYPES[code]).toBeDefined();
      seen.set(code, (seen.get(code) ?? 0) + 1);
    }
    expect(seen.size).toBe(16);
    // 축마다 3문항 → 각 유형은 정확히 (4가지 다수결 조합)^4 = 256번 나온다
    for (const n of seen.values()) expect(n).toBe(256);
  });

  it('축별 다수결로 우세 성향을 정하고 응답 비율을 계산한다', () => {
    // E 2 : I 1, P 0 : F 3, L 3 : H 0, D 1 : S 2  →  EFLS
    const pick: Record<string, string> = {
      q1: 'E', q5: 'E', q9: 'I',
      q2: 'F', q6: 'F', q10: 'F',
      q3: 'L', q7: 'L', q11: 'L',
      q4: 'D', q8: 'S', q12: 'S',
    };
    const answers: Answers = {};
    for (const q of QUESTIONS) answers[q.id] = (q.A.pole === pick[q.id] ? 'A' : 'B') as Choice;

    const result = scoreAnswers(answers);
    expect(result.code).toBe('EFLS');
    const byAxis = Object.fromEntries(result.axes.map((a) => [a.axis, a]));
    expect(byAxis.EI).toMatchObject({ leftCount: 2, rightCount: 1, leftPercent: 67, winner: 'E' });
    expect(byAxis.PF).toMatchObject({ leftCount: 0, rightCount: 3, leftPercent: 0, winner: 'F' });
    expect(byAxis.LH).toMatchObject({ leftCount: 3, rightCount: 0, leftPercent: 100, winner: 'L' });
    expect(byAxis.DS).toMatchObject({ leftCount: 1, rightCount: 2, leftPercent: 33, winner: 'S' });
  });

  it('모든 문항에 답하지 않으면 결과를 만들지 않는다', () => {
    const answers = answersFor('IFHS');
    delete answers.q7;
    expect(isComplete(answers)).toBe(false);
    expect(() => scoreAnswers(answers)).toThrow(IncompleteAnswersError);
    try {
      scoreAnswers(answers);
    } catch (e) {
      expect((e as IncompleteAnswersError).missing).toEqual(['q7']);
    }
    expect(() => scoreAnswers({})).toThrow(IncompleteAnswersError);
  });

  it('A/B 이외의 값은 응답으로 인정하지 않는다', () => {
    const answers = answersFor('EPLD') as Record<string, unknown>;
    answers.q1 = 'C';
    expect(isComplete(answers as Answers)).toBe(false);
  });
});

describe('유형 데이터', () => {
  it('16개 유형이 요구된 필드를 모두 가진다', () => {
    expect(TYPE_CODES).toHaveLength(16);
    for (const code of TYPE_CODES) {
      const t = TYPES[code];
      expect(t.code).toBe(code);
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.emoji.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(20);
      expect(t.strengths).toHaveLength(3);
      expect(t.cautions).toHaveLength(2);
      expect(t.relatable).toHaveLength(3);
      expect(t.advice.length).toBeGreaterThan(0);
    }
  });

  it('캐릭터 이름이 기획서와 일치한다', () => {
    const expected: Record<TypeCode, string> = {
      EPLD: '회의실 지배자', EPLS: '전략형 참모', EPHD: '열정의 팀장님', EPHS: '분위기 메이커',
      EFLD: '즉흥 해결사', EFLS: '만능 협상가', EFHD: '프로젝트 불도저', EFHS: '사내 인싸',
      IPLD: '조용한 지휘관', IPLS: '엑셀의 마법사', IPHD: '원칙의 수호자', IPHS: '든든한 조력자',
      IFLD: '독립형 해결사', IFLS: '숨은 실력자', IFHD: '아이디어 장인', IFHS: '평화로운 관찰자',
    };
    for (const code of TYPE_CODES) expect(TYPES[code].name).toBe(expected[code]);
  });
});
