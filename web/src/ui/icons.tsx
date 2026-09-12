/** Line icons, 1.5px stroke, 20px box. Currency colour, so tone comes from the parent. */

type P = { size?: number; className?: string };
const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none' as const,
  'aria-hidden': true as const,
});
const s = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function MailIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" {...s} />
      <path d="m3.2 5.6 6.8 5 6.8-5" {...s} />
    </svg>
  );
}

export function ChatIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M17 11.2a2.8 2.8 0 0 1-2.8 2.8H7.6L4 16.8V6.3a2.8 2.8 0 0 1 2.8-2.8h7.4A2.8 2.8 0 0 1 17 6.3Z" {...s} />
    </svg>
  );
}

export function TasksIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="m2.8 6.2 1.8 1.8 3-3.4" {...s} />
      <path d="m2.8 13.4 1.8 1.8 3-3.4" {...s} />
      <path d="M10.4 6h6.8M10.4 14h6.8" {...s} />
    </svg>
  );
}

export function CalendarIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="3" y="5" width="14" height="12" rx="2" {...s} />
      <path d="M3.4 8.6h13.2M7 3.2v3M13 3.2v3" {...s} />
    </svg>
  );
}

export function CrmIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="7.6" cy="7.4" r="2.6" {...s} />
      <path d="M3 16.4c.4-2.4 2.3-3.8 4.6-3.8s4.2 1.4 4.6 3.8" {...s} />
      <path d="M13.4 5.4a2.4 2.4 0 0 1 0 4.6M14.6 12.9c1.4.5 2.2 1.7 2.5 3.5" {...s} />
    </svg>
  );
}

export function SheetsIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="3.4" y="3.4" width="13.2" height="13.2" rx="2" {...s} />
      <path d="M3.6 8h12.8M3.6 12.4h12.8M8.4 3.6v12.8" {...s} />
    </svg>
  );
}

/** The four detectors, each with its own silhouette so the list scans. */

export function OpenLoopIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M3 7.6h7.4a3.2 3.2 0 0 1 0 6.4H6.8" {...s} />
      <path d="m8.8 11.8-2 2.2 2 2.2" {...s} />
      <circle cx="14.6" cy="5.4" r="2.4" {...s} />
    </svg>
  );
}

export function StalledIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="10" cy="10.4" r="6.4" {...s} />
      <path d="M10 7v3.6l2.4 1.6" {...s} />
      <path d="M15.8 3.4 17.4 5" {...s} />
    </svg>
  );
}

export function DeadlineIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="3" y="5" width="14" height="12" rx="2" {...s} />
      <path d="M3.4 8.6h13.2M7 3.2v3M13 3.2v3" {...s} />
      <path d="m8.2 12.2 3.6 3.4M11.8 12.2l-3.6 3.4" {...s} />
    </svg>
  );
}

export function SpofIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="10" cy="6" r="2.4" {...s} />
      <path d="M10 8.6v2.6M10 11.2 4.6 15.6M10 11.2l5.4 4.4M10 11.2v4.6" {...s} />
    </svg>
  );
}

/** Governance and status. */

export function LockIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="4.4" y="8.6" width="11.2" height="7.6" rx="2" {...s} />
      <path d="M7 8.6V6.8a3 3 0 0 1 6 0v1.8" {...s} />
    </svg>
  );
}

export function CheckIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="m4.4 10.4 3.6 3.6 7.6-7.8" {...s} />
    </svg>
  );
}

export function GraphIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="5" cy="6" r="1.9" {...s} />
      <circle cx="15.2" cy="4.8" r="1.9" {...s} />
      <circle cx="13.8" cy="14.6" r="1.9" {...s} />
      <circle cx="5.6" cy="14" r="1.9" {...s} />
      <path d="m6.8 6.6 6.6-1M6.1 7.7l-.3 4.4M7.4 13.9l4.5.5M14.6 6.6l-.5 6.1" {...s} />
    </svg>
  );
}

export function WebhookIcon({ size = 20, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="10" cy="5.4" r="2.4" {...s} />
      <path d="M8.6 7.5 5.8 12.3" {...s} />
      <circle cx="4.8" cy="14.4" r="2.4" {...s} />
      <path d="M7.2 14.4h6" {...s} />
      <circle cx="15.4" cy="14.4" r="2.4" {...s} />
      <path d="m11.4 7.5 2.8 4.8" {...s} />
    </svg>
  );
}

export function APP_ICON(app: string, size = 14) {
  switch (app) {
    case 'Mail':
      return <MailIcon size={size} />;
    case 'Chat':
      return <ChatIcon size={size} />;
    case 'Tasks':
      return <TasksIcon size={size} />;
    case 'Calendar':
      return <CalendarIcon size={size} />;
    case 'Sheets':
      return <SheetsIcon size={size} />;
    default:
      return <CrmIcon size={size} />;
  }
}
