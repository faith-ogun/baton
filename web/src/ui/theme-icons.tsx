type P = { size?: number; className?: string };
const s = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SunIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="3.6" {...s} />
      <path d="M10 2.6v1.6M10 15.8v1.6M2.6 10h1.6M15.8 10h1.6M4.8 4.8l1.1 1.1M14.1 14.1l1.1 1.1M15.2 4.8l-1.1 1.1M5.9 14.1l-1.1 1.1" {...s} />
    </svg>
  );
}

export function MoonIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M16 12.4A6.6 6.6 0 0 1 7.6 4a6.8 6.8 0 1 0 8.4 8.4Z" {...s} />
    </svg>
  );
}

export function CompassIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7" {...s} />
      <path d="m12.8 7.2-1.5 4.1-4.1 1.5 1.5-4.1Z" {...s} />
    </svg>
  );
}

export function ChevronIcon({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="m6.5 8.2 3.5 3.6 3.5-3.6" {...s} />
    </svg>
  );
}

export function CoinIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7" {...s} />
      <path d="M11.9 7.6a2.6 2.6 0 0 0-3.8.5c-.7 1.2.2 2.3 1.9 2.6 1.7.3 2.6 1.4 1.9 2.6a2.6 2.6 0 0 1-3.8.5M10 5.6v1.3M10 13.1v1.3" {...s} />
    </svg>
  );
}
