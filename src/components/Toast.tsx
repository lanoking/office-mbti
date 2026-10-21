import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Tone = 'info' | 'error';
interface ToastState {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, tone: Tone = 'info') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        role="status"
        aria-live="polite"
      >
        {toast && (
          <p
            key={toast.id}
            className={`animate-fade-up rounded-2xl px-5 py-3 text-[15px] font-medium shadow-card ${
              toast.tone === 'error' ? 'bg-[#3b1f24] text-[#ffd9de]' : 'bg-ink/90 text-white'
            }`}
          >
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
