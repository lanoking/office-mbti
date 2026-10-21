import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'soft' | 'ghost' | 'outline';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-deep active:scale-[0.98] disabled:bg-brand/40',
  soft: 'bg-brand-soft text-brand-deep hover:bg-[#e1dfff] active:scale-[0.98]',
  outline: 'bg-white text-ink ring-1 ring-line hover:bg-[#fafaff] active:scale-[0.98]',
  ghost: 'bg-transparent text-sub hover:bg-black/[0.04]',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[16px] font-semibold transition duration-150 disabled:cursor-not-allowed ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-3xl bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-3 text-[17px] font-bold tracking-tight text-ink">
      {children}
    </h2>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-white/60 px-4 py-3 text-center text-[13px] leading-relaxed text-faint">{children}</p>
  );
}
