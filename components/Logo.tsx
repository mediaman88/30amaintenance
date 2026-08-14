import Image from "next/image";
import { site } from "@/site.config";

/**
 * The brand mark.
 *
 * Drop the real logo file at public/logo.png (or .svg) and set `logoSrc` in
 * site.config.ts — it is then used everywhere the mark appears. Until then the
 * SVG below stands in: a badge built from the same navy ring, gold disc, and
 * "30A" lockup, so the site reads as the right brand rather than a placeholder.
 */
export default function Logo({ className = "" }: { className?: string }) {
  if (site.logoSrc) {
    return (
      <Image
        src={site.logoSrc}
        alt=""
        width={96}
        height={96}
        className={className}
        priority
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" fill="#fff" />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="var(--color-navy-900)"
        strokeWidth="6"
      />

      {/* "3" and "A" flanking the gold disc that replaces the zero. */}
      <text
        x="21"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="42"
        fontWeight="800"
        fill="var(--color-navy-900)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        3
      </text>
      <text
        x="79"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="42"
        fontWeight="800"
        fill="var(--color-navy-900)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        A
      </text>

      <circle
        cx="50"
        cy="52"
        r="17"
        fill="var(--color-gold-400)"
        stroke="var(--color-navy-900)"
        strokeWidth="3"
      />

      {/* Paint roller over crossed wrench and hammer, as in the logo. */}
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="41" y="46" width="14" height="5" rx="1.2" fill="#fff" />
        <path d="M55 48.5h4v-3h-3.5" />
        <path d="m44 57 5 5" />
        <path d="m56 57-5 5" />
      </g>

      {/* The wordmark from the real logo is deliberately left off: the mark
          renders at ~36px in the header, where set type that small turns to
          mud, and the business name already sits beside it as live text. */}
      <path d="M26 72h48" stroke="var(--color-navy-900)" strokeWidth="2.5" />
    </svg>
  );
}
