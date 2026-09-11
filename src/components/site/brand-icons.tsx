// Small brand glyphs for platforms not reliably present across lucide-react
// versions (TikTok has no official lucide icon; X's mark is simple enough
// to draw directly). Sized/styled to match lucide's 24x24 icon conventions
// so they sit naturally next to Instagram/Facebook/Youtube icons.

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 2h-3.2v13.6a3.1 3.1 0 1 1-2.2-2.97V9.3a6.3 6.3 0 1 0 5.4 6.24V9.14a7.6 7.6 0 0 0 4.5 1.46V7.4a4.4 4.4 0 0 1-4.5-4.4V2Z" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.7L4.5 22H1.4l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18.2h1.7L7.4 3.7H5.6l12.1 16.5Z" />
    </svg>
  );
}
