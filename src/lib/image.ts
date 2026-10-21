export class ImageSaveError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ImageSaveError';
  }
}

/**
 * DOM 노드를 PNG로 렌더링해 다운로드한다.
 * 웹폰트를 불러오지 못하는 환경이면 폰트 임베딩을 건너뛰고 한 번 더 시도한다.
 */
export async function saveNodeAsPng(node: HTMLElement | null, filename: string): Promise<void> {
  if (!node) throw new ImageSaveError('저장할 카드를 찾지 못했어요.');

  let toPng: typeof import('html-to-image').toPng;
  try {
    ({ toPng } = await import('html-to-image'));
  } catch (cause) {
    throw new ImageSaveError('이미지 저장 기능을 불러오지 못했어요. 네트워크를 확인해 주세요.', { cause });
  }

  const base = {
    pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    cacheBust: true,
    backgroundColor: '#ffffff',
  };

  let dataUrl: string;
  try {
    dataUrl = await toPng(node, base);
  } catch {
    try {
      dataUrl = await toPng(node, { ...base, skipFonts: true });
    } catch (cause) {
      throw new ImageSaveError('이미지를 만들지 못했어요. 화면을 캡처해서 저장해 주세요.', { cause });
    }
  }

  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (cause) {
    throw new ImageSaveError('다운로드를 시작하지 못했어요.', { cause });
  }
}
