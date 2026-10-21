import { describe, expect, it } from 'vitest';
import { TYPE_CODES } from '../data/types';
import { BASE_SCORE, bestMatches, calculateCompatibility } from './compatibility';

describe('궁합 점수 계산', () => {
  it('같은 유형끼리: 50 + 15 + 15 + 10 + 5 = 95', () => {
    expect(calculateCompatibility('EPLD', 'EPLD').score).toBe(95);
  });

  it('업무 태도만 다르면 최고점: 50 + 15 + 15 + 10 + 10 = 100', () => {
    expect(calculateCompatibility('EPLD', 'EPLS').score).toBe(100);
  });

  it('업무 태도만 같고 나머지가 다르면 최저점: 50 + 5 + 5 + 5 + 5 = 70', () => {
    expect(calculateCompatibility('EPLD', 'IFHD').score).toBe(70);
  });

  it('모두 다르면: 50 + 5 + 5 + 5 + 10 = 75', () => {
    expect(calculateCompatibility('EPLD', 'IFHS').score).toBe(75);
  });

  it('축별 가산점이 규칙대로 붙는다', () => {
    const r = calculateCompatibility('EPHS', 'IPLS');
    // 소통 불일치 5, 업무처리 일치 15, 의사결정 불일치 5, 업무태도 일치 5
    expect(r.axes.map((a) => a.points)).toEqual([5, 15, 5, 5]);
    expect(r.score).toBe(BASE_SCORE + 30);
  });

  it('모든 조합이 70~100점, 대칭이고, 4개 축의 협업 팁을 가진다', () => {
    for (const a of TYPE_CODES) {
      for (const b of TYPE_CODES) {
        const r = calculateCompatibility(a, b);
        expect(r.score).toBeGreaterThanOrEqual(70);
        expect(r.score).toBeLessThanOrEqual(100);
        expect(calculateCompatibility(b, a).score).toBe(r.score);
        expect(r.axes).toHaveLength(4);
        for (const axis of r.axes) expect(axis.tip.length).toBeGreaterThan(0);
        expect(r.title.length).toBeGreaterThan(0);
        expect(r.summary.length).toBeGreaterThan(0);
      }
    }
  });

  it('궁합 좋은 동료는 나를 빼고 점수 높은 순으로 고른다', () => {
    const top = bestMatches('IFHD');
    expect(top).toHaveLength(3);
    expect(top[0]).toMatchObject({ b: 'IFHS', score: 100 });
    expect(top.every((m) => m.b !== 'IFHD')).toBe(true);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
  });
});
