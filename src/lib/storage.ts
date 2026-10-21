import { QUESTIONS, type Choice } from '../data/questions';
import { AXES } from '../data/axes';
import { isTypeCode, type TypeCode } from '../data/types';
import type { Answers } from './scoring';

// 개인정보 없이 응답 선택값(A/B)과 유형 코드만 브라우저에 저장한다.
export const PROGRESS_KEY = 'office-mbti:progress:v1';
export const RESULT_KEY = 'office-mbti:result:v1';

export interface Progress {
  answers: Answers;
  /** 현재 보고 있는 문항 인덱스 */
  index: number;
}

export interface SavedResult {
  code: TypeCode;
  /** 축 순서대로 왼쪽 성향 선택 수 (0~3) */
  leftCounts: number[];
  savedAt: string;
}

type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** localStorage가 막혀 있는 환경(사파리 비공개 모드 등)에서도 앱이 죽지 않도록 감싼다 */
function defaultStore(): KV | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readJson(store: KV | null, key: string): unknown {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(store: KV | null, key: string, value: unknown): boolean {
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(store: KV | null, key: string) {
  try {
    store?.removeItem(key);
  } catch {
    /* 무시 */
  }
}

const VALID_IDS = new Set(QUESTIONS.map((q) => q.id));

export function sanitizeAnswers(value: unknown): Answers {
  const out: Answers = {};
  if (!value || typeof value !== 'object') return out;
  for (const [id, choice] of Object.entries(value as Record<string, unknown>)) {
    if (VALID_IDS.has(id) && (choice === 'A' || choice === 'B')) out[id] = choice as Choice;
  }
  return out;
}

export function loadProgress(store: KV | null = defaultStore()): Progress | null {
  const data = readJson(store, PROGRESS_KEY) as Partial<Progress> | null;
  if (!data || typeof data !== 'object') return null;
  const answers = sanitizeAnswers(data.answers);
  const rawIndex = typeof data.index === 'number' && Number.isFinite(data.index) ? Math.floor(data.index) : 0;
  const index = Math.min(Math.max(rawIndex, 0), QUESTIONS.length - 1);
  if (Object.keys(answers).length === 0 && index === 0) return null;
  return { answers, index };
}

export function saveProgress(progress: Progress, store: KV | null = defaultStore()): boolean {
  return writeJson(store, PROGRESS_KEY, progress);
}

export function clearProgress(store: KV | null = defaultStore()) {
  remove(store, PROGRESS_KEY);
}

export function loadResult(store: KV | null = defaultStore()): SavedResult | null {
  const data = readJson(store, RESULT_KEY) as Partial<SavedResult> | null;
  if (!data || typeof data !== 'object' || !isTypeCode(data.code)) return null;
  const counts = Array.isArray(data.leftCounts) ? data.leftCounts : [];
  const valid =
    counts.length === AXES.length && counts.every((n) => Number.isInteger(n) && n >= 0 && n <= 3);
  return {
    code: data.code,
    leftCounts: valid ? (counts as number[]) : [],
    savedAt: typeof data.savedAt === 'string' ? data.savedAt : '',
  };
}

export function saveResult(result: SavedResult, store: KV | null = defaultStore()): boolean {
  return writeJson(store, RESULT_KEY, result);
}

export function clearResult(store: KV | null = defaultStore()) {
  remove(store, RESULT_KEY);
}
