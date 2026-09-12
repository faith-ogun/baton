import type { ReactNode } from 'react';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1160px] px-6 sm:px-8 ${className}`}>{children}</div>;
}

export function Kicker({
  children,
  tone = 'accent',
  className = '',
}: {
  children: ReactNode;
  tone?: 'accent' | 'ink' | 'paper' | 'agent';
  className?: string;
}) {
  const colour = {
    accent: 'text-accent-ink',
    ink: 'text-ink-3',
    paper: 'text-paper-3/80',
    agent: 'text-agent-ink',
  }[tone];
  return <p className={`kicker ${colour} ${className}`}>{children}</p>;
}

/** The signature: a baton, handed left to right. Opens every section. */
export function BatonRule({ width = 44, className = '' }: { width?: number; className?: string }) {
  return <span className={`baton-rule ${className}`} style={{ width }} aria-hidden="true" />;
}

/** Primary action. The 2px hard shadow in burnt orange is the signature move. */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'onInk' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const base =
    'group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9375rem] font-medium transition-all duration-150 active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50';
  const styles = {
    primary: 'bg-ink text-paper shadow-press hover:bg-ink-2 active:shadow-none',
    secondary: 'border border-line-2 bg-card text-ink hover:border-ink hover:bg-paper-2 active:shadow-none',
    onInk: 'bg-paper text-ink shadow-[0_2px_0_var(--color-accent)] hover:bg-white active:shadow-none',
    ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
  }[variant];
  const cls = `${base} ${styles} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 group-hover:translate-x-0.5 ${className}`}
    >
      <path
        d="M3 8h10m0 0-3.6-3.6M13 8l-3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type ChipTone = 'neutral' | 'accent' | 'agent' | 'info' | 'ok' | 'warn' | 'risk' | 'onInk' | 'onInkAccent';

/** Small labelled pill: apps, statuses, rule names, people. */
export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
}) {
  const styles: Record<ChipTone, string> = {
    // `neutral` reads off the themed app tokens, so one chip works on the
    // light site and in both cuts of the dashboard.
    neutral: 'border-hair bg-panel-2 text-mid',
    accent: 'border-accent/25 bg-accent-soft text-accent-ink',
    agent: 'border-agent/25 bg-agent-soft text-agent-ink',
    info: 'border-info/25 bg-info-soft text-info-ink',
    ok: 'border-ok/25 bg-ok-soft text-ok',
    warn: 'border-warn/40 bg-warn-soft text-[#8a6415]',
    risk: 'border-risk/25 bg-risk-soft text-risk',
    onInk: 'border-white/12 bg-white/[0.06] text-paper-3',
    onInkAccent: 'border-accent-lift/35 bg-accent-lift/12 text-accent-lift',
  };
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] font-medium tracking-[0.02em] ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Dot({
  tone = 'ok',
  pulse = true,
  size = 6,
}: {
  tone?: 'ok' | 'warn' | 'risk' | 'accent' | 'agent' | 'info';
  pulse?: boolean;
  size?: number;
}) {
  const bg = {
    ok: 'bg-ok text-ok',
    warn: 'bg-warn text-warn',
    risk: 'bg-risk text-risk',
    accent: 'bg-accent text-accent',
    agent: 'bg-agent text-agent',
    info: 'bg-info text-info',
  }[tone];
  return (
    <span
      className={`inline-block rounded-full ${bg} ${pulse ? 'bt-pulse' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/** Section heading block: kicker, baton rule, headline, optional standfirst. */
export function SectionHead({
  kicker,
  title,
  lede,
  align = 'left',
  tone = 'light',
  className = '',
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const centred = align === 'center';
  return (
    <div className={`${centred ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      <div className={`flex items-center gap-3 ${centred ? 'justify-center' : ''}`}>
        <BatonRule width={28} />
        <Kicker tone={tone === 'dark' ? 'paper' : 'accent'}>{kicker}</Kicker>
      </div>
      <h2
        className={`display-tight mt-4 text-[2rem] text-balance sm:text-[2.6rem] ${
          tone === 'dark' ? 'text-paper' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-5 text-[1.0625rem] leading-[1.7] ${
            tone === 'dark' ? 'text-paper-3/85' : 'text-ink-2'
          } ${centred ? 'mx-auto max-w-[58ch]' : 'max-w-[58ch]'}`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

export function Card({
  children,
  className = '',
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  return (
    <As className={`rounded-2xl border border-line bg-card p-6 shadow-paper ${className}`}>{children}</As>
  );
}
