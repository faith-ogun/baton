/**
 * The mark, both cuts. `reverse` is the cream-on-navy version, for the dark
 * app ground, where the navy figure would otherwise vanish into the page.
 */
export function Mark({
  size = 32,
  reverse = false,
  className = '',
}: {
  size?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <img
      src={reverse ? '/brand/baton-mark-reverse.png' : '/brand/baton-mark.png'}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

export function Lockup({
  width = 200,
  reverse = false,
  className = '',
}: {
  width?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <img
      src={reverse ? '/brand/baton-lockup-reverse.png' : '/brand/baton-lockup.png'}
      width={width}
      alt="Baton"
      className={`select-none ${className}`}
      style={{ width, height: 'auto' }}
    />
  );
}

/**
 * Wordmark-beside-mark, for navigation bars where the stacked lockup is too
 * tall. Fraunces set to match the logo board's own letterforms.
 */
export function Wordmark({ reverse = false, size = 30 }: { reverse?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={size} reverse={reverse} />
      <span
        className="display-tight"
        style={{
          fontSize: size * 0.78,
          letterSpacing: '-0.03em',
          color: reverse ? 'var(--color-paper)' : 'var(--color-ink)',
        }}
      >
        Baton
      </span>
    </span>
  );
}
