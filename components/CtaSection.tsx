import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-[#07090d] px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 px-6 py-14 text-center shadow-2xl shadow-blue-900/20 sm:px-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
          Ready to trade firm capital?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-blue-100">
          Pick your account, prove your skills and get paid for your profits.
        </p>
        <a
          href="#models"
          className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
        >
          Start Your Challenge <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
