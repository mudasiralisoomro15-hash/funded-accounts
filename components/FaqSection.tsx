"use client";

import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";

export default function FaqSection() {
  const { config } = useSiteConfig();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [cat, setCat] = useState("All");

  const categories = ["All", ...Array.from(new Set(config.faqs.map((f) => f.cat ?? "General")))];
  const visible = config.faqs.filter((f) => cat === "All" || (f.cat ?? "General") === cat);

  return (
    <section id="faq" className="relative scroll-mt-16 bg-[#07090d] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="mt-3 text-slate-400">Everything you need to know before you start.</p>
        </div>

        {/* Category tabs */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:justify-center">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCat(c);
                setOpenIndex(0);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                cat === c
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "border-white/10 bg-[#10141c] text-slate-400 hover:border-blue-500/50 hover:text-blue-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {visible.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border bg-[#10141c] transition-all duration-300 ${
                  isOpen
                    ? "border-blue-300 shadow-lg shadow-blue-900/10"
                    : "border-white/10 hover:border-blue-500/30"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="text-sm font-semibold text-white sm:text-base">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-blue-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400 sm:px-6">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl bg-blue-500/10 px-6 py-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold text-white">Still have questions?</p>
            <p className="text-sm text-slate-400">Our team is here to help, 24/7.</p>
          </div>
          <a
            href={`mailto:${config.supportEmail}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" /> {config.supportEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
