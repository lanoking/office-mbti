import { isTypeCode, type TypeCode } from '../data/types';

// 해시 기반 라우팅: 정적 호스팅(GitHub Pages 등)에서 서버 설정 없이 공유 링크가 동작한다.
export type Route =
  | { name: 'home' }
  | { name: 'test' }
  | { name: 'result'; code: TypeCode }
  | { name: 'match'; a?: TypeCode; b?: TypeCode };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [page, x, y] = parts;
  if (page === 'test') return { name: 'test' };
  if (page === 'result') {
    const code = x?.toUpperCase();
    return isTypeCode(code) ? { name: 'result', code } : { name: 'home' };
  }
  if (page === 'match') {
    const a = x?.toUpperCase();
    const b = y?.toUpperCase();
    return { name: 'match', a: isTypeCode(a) ? a : undefined, b: isTypeCode(b) ? b : undefined };
  }
  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'test':
      return '#/test';
    case 'result':
      return `#/result/${route.code}`;
    case 'match':
      return route.a && route.b ? `#/match/${route.a}/${route.b}` : route.a ? `#/match/${route.a}` : '#/match';
  }
}

/** 공유 URL: 유형 코드만 포함한다 (응답 내용·개인정보 없음) */
export function buildShareUrl(code: TypeCode, loc: Pick<Location, 'origin' | 'pathname'>): string {
  return `${loc.origin}${loc.pathname}#/result/${code}`;
}
