export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

const badge =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3";

export function UsdtBadge() {
  return (
    <span className={badge} title="USDT">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#26A17B] text-[11px] font-bold text-white">
        ₮
      </span>
      <span className="text-xs font-semibold text-slate-200">USDT</span>
    </span>
  );
}

export function VisaBadge() {
  return (
    <span className={badge} title="Visa">
      <span className="text-sm font-extrabold italic tracking-wide text-white">VISA</span>
    </span>
  );
}

export function MastercardBadge() {
  return (
    <span className={badge} title="Mastercard">
      <svg viewBox="0 0 36 22" className="h-5 w-8" aria-hidden="true">
        <circle cx="13" cy="11" r="9" fill="#EB001B" />
        <circle cx="23" cy="11" r="9" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    </span>
  );
}
