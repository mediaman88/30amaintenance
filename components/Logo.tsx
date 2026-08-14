/**
 * Placeholder mark: a "30A" road-sign silhouette over a wave.
 * Swap this for your real logo whenever you have one — it's the only place
 * the mark is defined, so replacing this file updates the whole site.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.35"
      />
      <text
        x="20"
        y="20.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="-0.5"
      >
        30A
      </text>
      <path
        d="M7 28.5c2.4 0 2.4 2.2 4.8 2.2s2.4-2.2 4.8-2.2 2.4 2.2 4.8 2.2 2.4-2.2 4.9-2.2 2.4 2.2 4.8 2.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
