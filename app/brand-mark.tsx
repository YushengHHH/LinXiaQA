export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`brand-mark ${className}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="butt">
        <path
          className="mark-deep mark-wide"
          d="M28 0 L54 26 M66 38 L82 54 M94 66 L120 92"
        />
        <path
          className="mark-soft mark-thin"
          d="M0 28 L26 54 M38 66 L54 82 M66 94 L92 120"
        />
        <path
          className="mark-deep mark-wide"
          d="M0 92 L26 66 M38 54 L54 38 M66 26 L92 0"
        />
        <path
          className="mark-soft mark-thin"
          d="M28 120 L54 94 M66 82 L82 66 M94 54 L120 28"
        />
      </g>
      <circle className="mark-dot" cx="60" cy="60" r="2.8" />
    </svg>
  );
}
