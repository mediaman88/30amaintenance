import type { IconName } from "@/site.config";

type Props = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function InstagramIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22C18.34 21.24 22 17.08 22 12.06Z"
      />
    </svg>
  );
}

export function ArrowIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function PhoneIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
    </svg>
  );
}

export function MailIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function MapPinIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ClockIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </svg>
  );
}

/** Five stars, filled to match a rating. Decorative — the numeric rating is
 *  always rendered as text next to it, so this carries no extra meaning. */
export function Stars({
  rating,
  className = "h-4 w-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={className}
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinejoin="round"
          style={{ color: "var(--color-sun-400)" }}
        >
          <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
        </svg>
      ))}
    </span>
  );
}

/* ── Service icons ──────────────────────────────────────────────────────── */

const serviceIcons: Record<IconName, React.ReactNode> = {
  hammer: (
    <>
      <path d="M14.5 6.5 17 4l3 3-2.5 2.5" />
      <path d="m13 8 3 3" />
      <path d="M15.5 10.5 8 18l-2 2-2-2 2-2 7.5-7.5" />
      <path d="M12.5 5.5 16 9" />
    </>
  ),
  wrench: (
    <>
      <path d="M15.5 3.5a5 5 0 0 0-4.9 6.2L3.7 16.6a2 2 0 0 0 2.8 2.8l6.9-6.9a5 5 0 0 0 6.2-6.2l-2.8 2.8-2.6-.7-.7-2.6 2.8-2.8a5 5 0 0 0-.8-.5Z" />
    </>
  ),
  paint: (
    <>
      <rect x="3.5" y="3.5" width="12" height="6" rx="1.5" />
      <path d="M15.5 6.5h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6" />
      <path d="M12.5 12.5v2.5" />
      <rect x="10.5" y="15" width="4" height="5.5" rx="1.4" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="16.5" r="3.5" />
      <path d="m10 14 8.5-8.5" />
      <path d="m16 8 2.5 2.5" />
      <path d="M18.5 5.5 21 8" />
    </>
  ),
  ruler: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.6" />
      <path d="M7 8.5v3M11 8.5v4.5M15 8.5v3M19 8.5v4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

export function ServiceIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      {serviceIcons[name]}
    </svg>
  );
}
