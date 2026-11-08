"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Centered popup with a close button. Closes on Esc and on a click outside. */
export default function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`dash-surface dash-border relative max-h-[88vh] w-full overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
          wide ? "max-w-xl" : "max-w-md"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="dash-text text-base font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="dash-sub dash-hover rounded-lg p-1.5">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
