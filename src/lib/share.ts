export type ShareOutcome =
  | { status: 'shared' }
  | { status: 'copied' }
  | { status: 'cancelled' }
  /** 공유·복사 모두 불가 → 화면에 링크를 보여 주고 직접 복사하게 한다 */
  | { status: 'manual'; url: string };

interface ShareEnv {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
  writeText?: (text: string) => Promise<void>;
}

function browserEnv(): ShareEnv {
  if (typeof navigator === 'undefined') return {};
  return {
    share: navigator.share?.bind(navigator),
    canShare: navigator.canShare?.bind(navigator),
    writeText: navigator.clipboard?.writeText?.bind(navigator.clipboard),
  };
}

/** 모바일은 기본 공유 시트, 그 외에는 클립보드 복사, 둘 다 안 되면 수동 복사로 단계적으로 대체한다 */
export async function shareLink(
  data: { title: string; text: string; url: string },
  env: ShareEnv = browserEnv(),
): Promise<ShareOutcome> {
  if (env.share && (!env.canShare || env.canShare(data))) {
    try {
      await env.share(data);
      return { status: 'shared' };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return { status: 'cancelled' };
      // 공유 시트 실패 시 클립보드로 넘어간다
    }
  }
  if (env.writeText) {
    try {
      await env.writeText(data.url);
      return { status: 'copied' };
    } catch {
      /* 권한 거부 등 → 수동 복사 */
    }
  }
  return { status: 'manual', url: data.url };
}
