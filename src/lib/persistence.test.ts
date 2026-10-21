import { describe, expect, it } from 'vitest';
import { buildShareUrl, parseHash, routeToHash } from './router';
import { shareLink } from './share';
import {
  PROGRESS_KEY,
  RESULT_KEY,
  clearProgress,
  loadProgress,
  loadResult,
  saveProgress,
  saveResult,
} from './storage';

function memoryStore() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe('localStorage 저장', () => {
  it('진행 상태를 저장하고 그대로 복원한다 (새로고침 대응)', () => {
    const store = memoryStore();
    saveProgress({ answers: { q1: 'A', q2: 'B' }, index: 2 }, store);
    expect(loadProgress(store)).toEqual({ answers: { q1: 'A', q2: 'B' }, index: 2 });
    clearProgress(store);
    expect(loadProgress(store)).toBeNull();
  });

  it('손상되거나 조작된 값은 걸러 낸다', () => {
    const store = memoryStore();
    store.setItem(PROGRESS_KEY, '{not json');
    expect(loadProgress(store)).toBeNull();

    store.setItem(PROGRESS_KEY, JSON.stringify({ answers: { q1: 'A', q99: 'A', q2: 'X' }, index: 999 }));
    expect(loadProgress(store)).toEqual({ answers: { q1: 'A' }, index: 11 });

    store.setItem(RESULT_KEY, JSON.stringify({ code: 'ABCD' }));
    expect(loadResult(store)).toBeNull();
  });

  it('결과에는 유형 코드와 선택 수만 저장된다', () => {
    const store = memoryStore();
    saveResult({ code: 'IPLS', leftCounts: [0, 3, 2, 1], savedAt: '2026-10-21T00:00:00.000Z' }, store);
    expect(JSON.parse(store.map.get(RESULT_KEY)!)).toEqual({
      code: 'IPLS',
      leftCounts: [0, 3, 2, 1],
      savedAt: '2026-10-21T00:00:00.000Z',
    });
    expect(loadResult(store)?.code).toBe('IPLS');
  });

  it('저장소를 쓸 수 없어도 오류 없이 동작한다', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadProgress(broken)).toBeNull();
    expect(saveProgress({ answers: {}, index: 0 }, broken)).toBe(false);
    expect(() => clearProgress(broken)).not.toThrow();
    expect(loadResult(null)).toBeNull();
  });
});

describe('라우팅과 공유 URL', () => {
  it('공유 URL에는 유형 코드만 담긴다', () => {
    const url = buildShareUrl('EFHS', { origin: 'https://example.com', pathname: '/office-mbti/' });
    expect(url).toBe('https://example.com/office-mbti/#/result/EFHS');
  });

  it('해시를 해석하고 잘못된 코드는 홈으로 보낸다', () => {
    expect(parseHash('#/result/efhs')).toEqual({ name: 'result', code: 'EFHS' });
    expect(parseHash('#/result/XXXX')).toEqual({ name: 'home' });
    expect(parseHash('#/test')).toEqual({ name: 'test' });
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(parseHash('#/match/EPLD/IFHS')).toEqual({ name: 'match', a: 'EPLD', b: 'IFHS' });
    expect(routeToHash({ name: 'match', a: 'EPLD', b: 'IFHS' })).toBe('#/match/EPLD/IFHS');
  });
});

describe('결과 공유', () => {
  const data = { title: 't', text: 'x', url: 'https://example.com/#/result/EPLD' };

  it('공유 시트가 있으면 사용한다', async () => {
    expect(await shareLink(data, { share: async () => {} })).toEqual({ status: 'shared' });
  });

  it('사용자가 공유를 취소하면 취소로 처리한다', async () => {
    const abort = Object.assign(new Error('cancel'), { name: 'AbortError' });
    expect(await shareLink(data, { share: async () => Promise.reject(abort) })).toEqual({ status: 'cancelled' });
  });

  it('공유 시트가 실패하면 클립보드로, 그것도 안 되면 수동 복사로 대체한다', async () => {
    let copied = '';
    const res = await shareLink(data, {
      share: async () => Promise.reject(new Error('fail')),
      writeText: async (t) => {
        copied = t;
      },
    });
    expect(res).toEqual({ status: 'copied' });
    expect(copied).toBe(data.url);

    expect(await shareLink(data, { writeText: async () => Promise.reject(new Error('denied')) })).toEqual({
      status: 'manual',
      url: data.url,
    });
    expect(await shareLink(data, {})).toEqual({ status: 'manual', url: data.url });
  });
});
